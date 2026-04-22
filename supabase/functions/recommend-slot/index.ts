import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location_id, duration_hours } = await req.json();
    if (!location_id) {
      return new Response(
        JSON.stringify({ error: "location_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get location info
    const { data: location } = await sb
      .from("parking_locations")
      .select("name, address, total_slots")
      .eq("id", location_id)
      .single();

    // Get all slots for this location
    const { data: slots } = await sb
      .from("parking_slots")
      .select("id, slot_number, floor, status")
      .eq("location_id", location_id);

    const available = (slots || []).filter((s) => s.status === "available");

    if (available.length === 0) {
      return new Response(
        JSON.stringify({
          recommendation: null,
          message: "No available slots at this location.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Compute floor crowding (lower occupancy = less crowded)
    const floorStats: Record<string, { total: number; available: number }> = {};
    (slots || []).forEach((s) => {
      const f = String(s.floor ?? 1);
      if (!floorStats[f]) floorStats[f] = { total: 0, available: 0 };
      floorStats[f].total++;
      if (s.status === "available") floorStats[f].available++;
    });

    // Fallback heuristic: pick slot on least-crowded floor with lowest slot number
    const heuristic = [...available].sort((a, b) => {
      const fa = String(a.floor ?? 1);
      const fb = String(b.floor ?? 1);
      const ca = floorStats[fa].available / floorStats[fa].total;
      const cb = floorStats[fb].available / floorStats[fb].total;
      if (cb !== ca) return cb - ca; // more availability = less crowded
      return a.slot_number.localeCompare(b.slot_number, undefined, { numeric: true });
    })[0];

    let recommendedSlot = heuristic;
    let reason = `Least-crowded floor (Floor ${heuristic.floor ?? 1}), nearest entry slot.`;

    // Try Lovable AI for smarter pick
    if (LOVABLE_API_KEY) {
      try {
        const aiResp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "You recommend the best parking slot. Choose the slot with the best balance of: nearest (lower floor + lower slot number), least crowded floor (highest availability ratio), and fits the requested duration. Respond ONLY by calling the tool.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    location: location?.name,
                    duration_hours: duration_hours || 1,
                    floor_stats: floorStats,
                    available_slots: available.map((s) => ({
                      id: s.id,
                      slot_number: s.slot_number,
                      floor: s.floor ?? 1,
                    })),
                  }),
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "pick_slot",
                    description: "Pick the best parking slot",
                    parameters: {
                      type: "object",
                      properties: {
                        slot_id: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["slot_id", "reason"],
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "pick_slot" } },
            }),
          },
        );

        if (aiResp.ok) {
          const data = await aiResp.json();
          const call = data.choices?.[0]?.message?.tool_calls?.[0];
          if (call) {
            const args = JSON.parse(call.function.arguments);
            const match = available.find((s) => s.id === args.slot_id);
            if (match) {
              recommendedSlot = match;
              reason = args.reason || reason;
            }
          }
        } else if (aiResp.status === 429 || aiResp.status === 402) {
          console.warn("AI gateway limit:", aiResp.status);
        }
      } catch (e) {
        console.warn("AI call failed, using heuristic:", e);
      }
    }

    return new Response(
      JSON.stringify({
        recommendation: {
          slot_id: recommendedSlot.id,
          slot_number: recommendedSlot.slot_number,
          floor: recommendedSlot.floor ?? 1,
          location_name: location?.name,
          reason,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("recommend-slot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

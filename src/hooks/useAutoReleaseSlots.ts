import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Periodically scans for active bookings whose end_time has passed,
 * marks them as "completed" and frees their parking slots.
 * Runs on mount and every 30 seconds while the dashboard is open.
 */
export function useAutoReleaseSlots() {
  useEffect(() => {
    const releaseExpired = async () => {
      const nowIso = new Date().toISOString();

      // Find expired active bookings
      const { data: expired, error } = await supabase
        .from("bookings")
        .select("id, slot_id")
        .eq("status", "active")
        .lt("end_time", nowIso);

      if (error || !expired || expired.length === 0) return;

      const bookingIds = expired.map((b) => b.id);
      const slotIds = Array.from(new Set(expired.map((b) => b.slot_id)));

      // Mark bookings as completed
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .in("id", bookingIds);

      // Free up the slots
      if (slotIds.length > 0) {
        await supabase
          .from("parking_slots")
          .update({ status: "available" })
          .in("id", slotIds);
      }
    };

    releaseExpired();
    const interval = setInterval(releaseExpired, 30000);
    return () => clearInterval(interval);
  }, []);
}

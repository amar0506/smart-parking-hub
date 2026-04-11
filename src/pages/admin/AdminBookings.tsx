import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string; vehicle_number: string; start_time: string; end_time: string; status: string;
  total_amount: number | null; created_at: string;
  parking_locations: { name: string } | null;
  parking_slots: { slot_number: string } | null;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("bookings").select("*, parking_locations(name), parking_slots(slot_number)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBookings((data as any) || []);
        setLoading(false);
      });
  }, []);

  const statusColor = (s: string) => {
    if (s === "active") return "bg-primary/10 text-primary border-primary/20";
    if (s === "completed") return "bg-accent/10 text-accent border-accent/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> All Bookings
          </h1>
          <p className="text-muted-foreground">View all user bookings across locations</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {bookings.map((b) => (
              <Card key={b.id} className="animate-fade-in">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{b.parking_locations?.name}</p>
                      <Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Slot {b.parking_slots?.slot_number} • {b.vehicle_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(b.start_time), "PPp")} → {format(new Date(b.end_time), "PPp")}
                    </p>
                  </div>
                  {b.total_amount && (
                    <span className="text-lg font-bold text-primary">₹{b.total_amount}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

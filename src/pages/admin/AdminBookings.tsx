import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, XCircle, Unlock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string; vehicle_number: string; start_time: string; end_time: string; status: string;
  total_amount: number | null; created_at: string; payment_status: string; slot_id: string;
  parking_locations: { name: string } | null;
  parking_slots: { slot_number: string } | null;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*, parking_locations(name), parking_slots(slot_number)")
      .order("created_at", { ascending: false });
    setBookings((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (bookingId: string, slotId: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    await supabase.from("parking_slots").update({ status: "available" }).eq("id", slotId);
    toast({ title: "Booking cancelled" });
    fetchBookings();
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-primary/10 text-primary border-primary/20";
    if (s === "completed") return "bg-accent/10 text-accent border-accent/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  const paymentColor = (s: string) => {
    if (s === "paid") return "bg-accent/10 text-accent border-accent/20";
    if (s === "pending") return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> All Bookings
          </h1>
          <p className="text-muted-foreground">View and manage all bookings across locations</p>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{b.parking_locations?.name}</p>
                      <Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge>
                      <Badge variant="outline" className={paymentColor(b.payment_status)}>{b.payment_status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Slot {b.parking_slots?.slot_number} • {b.vehicle_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(b.start_time), "PPp")} → {format(new Date(b.end_time), "PPp")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.total_amount && (
                      <span className="text-lg font-bold text-primary">₹{b.total_amount}</span>
                    )}
                    {b.status === "active" && (
                      <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id, b.slot_id)}>
                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

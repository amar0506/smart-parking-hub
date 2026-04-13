import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Car, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  vehicle_number: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  created_at: string;
  slot_id: string;
  parking_locations: { name: string; address: string } | null;
  parking_slots: { slot_number: string; floor: number | null } | null;
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, parking_locations(name, address), parking_slots(slot_number, floor)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const cancelBooking = async (bookingId: string, slotId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    if (!error) {
      await supabase.from("parking_slots").update({ status: "available" }).eq("id", slotId);
      toast({ title: "Booking cancelled" });
      fetchBookings();
    }
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
            <CalendarDays className="h-6 w-6 text-primary" /> My Bookings
          </h1>
          <p className="text-muted-foreground">View and manage your parking reservations</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet. Start by booking a parking slot!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <Card key={b.id} className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{b.parking_locations?.name || "Unknown"}</h3>
                        <Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge>
                        <Badge variant="outline" className={paymentColor(b.payment_status)}>{b.payment_status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Slot {b.parking_slots?.slot_number} • Floor {b.parking_slots?.floor || 1} • {b.vehicle_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(b.start_time), "PPp")} → {format(new Date(b.end_time), "PPp")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {b.total_amount && (
                        <span className="text-lg font-bold text-primary">₹{b.total_amount}</span>
                      )}
                      {b.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id, b.slot_id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
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

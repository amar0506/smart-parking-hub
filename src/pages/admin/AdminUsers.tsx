import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, XCircle, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface ProfileData {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface BookingRow {
  id: string;
  user_id: string;
  vehicle_number: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  slot_id: string;
  parking_locations: { name: string } | null;
  parking_slots: { slot_number: string } | null;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const [bookingsRes, profilesRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, parking_locations(name), parking_slots(slot_number)")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, email"),
    ]);
    setBookings((bookingsRes.data as any) || []);
    setProfiles(profilesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getProfile = (userId: string) => profiles.find((p) => p.user_id === userId);

  const cancelBooking = async (bookingId: string, slotId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    if (!error) {
      await supabase.from("parking_slots").update({ status: "available" }).eq("id", slotId);
      toast({ title: "Booking cancelled successfully" });
      fetchData();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const forceReleaseSlot = async (slotId: string, bookingId: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    await supabase.from("parking_slots").update({ status: "available" }).eq("id", slotId);
    toast({ title: "Slot force released" });
    fetchData();
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

  const filtered = bookings.filter((b) => {
    const profile = getProfile(b.user_id);
    const name = (profile?.full_name || "").toLowerCase();
    const email = (profile?.email || "").toLowerCase();
    const q = search.toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      b.vehicle_number.toLowerCase().includes(q) ||
      (b.parking_locations?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Users & Bookings
            </h1>
            <p className="text-muted-foreground">View all users, their bookings, and manage reservations</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, vehicle..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{profiles.length}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{bookings.filter(b => b.status === "active").length}</div>
            <p className="text-sm text-muted-foreground">Active Bookings</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{bookings.filter(b => b.payment_status === "paid").length}</div>
            <p className="text-sm text-muted-foreground">Paid Bookings</p>
          </CardContent></Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading users...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings found.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vehicle No.</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Booking Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((b) => {
                      const profile = getProfile(b.user_id);
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{profile?.full_name || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{profile?.email || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">{b.vehicle_number}</TableCell>
                          <TableCell>{b.parking_locations?.name || "—"}</TableCell>
                          <TableCell>{b.parking_slots?.slot_number || "—"}</TableCell>
                          <TableCell className="text-sm">
                            <div>{format(new Date(b.start_time), "PP")}</div>
                            <div className="text-muted-foreground">{format(new Date(b.start_time), "p")} – {format(new Date(b.end_time), "p")}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentColor(b.payment_status)}>{b.payment_status}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {b.total_amount ? `₹${b.total_amount}` : "—"}
                          </TableCell>
                          <TableCell>
                            {b.status === "active" && (
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id, b.slot_id)}>
                                  <XCircle className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => forceReleaseSlot(b.slot_id, b.id)} className="text-destructive">
                                  <Unlock className="h-3 w-3 mr-1" /> Release
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

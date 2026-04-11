import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Car, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParkingLocation {
  id: string; name: string; address: string; price_per_hour: number; total_slots: number;
}
interface ParkingSlot {
  id: string; slot_number: string; floor: number | null; status: string;
}

export default function BookingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedLocation = searchParams.get("location");

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(preselectedLocation || "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    supabase.from("parking_locations").select("*").eq("is_active", true)
      .then(({ data }) => setLocations(data || []));
  }, []);

  useEffect(() => {
    if (!selectedLocation) { setSlots([]); return; }
    supabase.from("parking_slots").select("*").eq("location_id", selectedLocation).eq("status", "available")
      .then(({ data }) => setSlots(data || []));
  }, [selectedLocation]);

  const selectedLoc = locations.find((l) => l.id === selectedLocation);

  const calculateAmount = () => {
    if (!startTime || !endTime || !selectedLoc) return 0;
    const hours = Math.max(1, Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / 3600000));
    return hours * selectedLoc.price_per_hour;
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const amount = calculateAmount();
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        slot_id: selectedSlot,
        location_id: selectedLocation,
        vehicle_number: vehicleNumber,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        total_amount: amount,
        status: "active",
      });
      if (error) throw error;

      // Mark slot as reserved
      await supabase.from("parking_slots").update({ status: "reserved" }).eq("id", selectedSlot);

      setBooked(true);
      toast({ title: "Booking confirmed!", description: `Slot booked for ₹${amount}` });
    } catch (error: any) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center animate-scale-in">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">Your parking slot has been reserved.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/bookings")}>View Bookings</Button>
                <Button variant="outline" onClick={() => { setBooked(false); setSelectedSlot(""); setVehicleNumber(""); }}>
                  Book Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Book a Parking Slot
          </h1>
          <p className="text-muted-foreground">Select a location and available slot</p>
        </div>

        <Card className="animate-slide-up">
          <CardContent className="pt-6">
            <form onSubmit={handleBook} className="space-y-5">
              {/* Location */}
              <div className="space-y-2">
                <Label>Parking Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name} — ₹{l.price_per_hour}/hr</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slot */}
              <div className="space-y-2">
                <Label>Available Slot</Label>
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger><SelectValue placeholder={slots.length ? "Select slot" : "Select a location first"} /></SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => (
                      <SelectItem key={s.id} value={s.id}>Slot {s.slot_number} — Floor {s.floor || 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="MP 20 AB 1234" required />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              {/* Total */}
              {calculateAmount() > 0 && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{calculateAmount()}</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !selectedSlot || !vehicleNumber || !startTime || !endTime}>
                <Car className="mr-2 h-4 w-4" />
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

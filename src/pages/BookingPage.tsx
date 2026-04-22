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
import { CalendarDays, Car, CheckCircle, CreditCard, QrCode, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

interface ParkingLocation {
  id: string; name: string; address: string; price_per_hour: number; total_slots: number;
}
interface ParkingSlot {
  id: string; slot_number: string; floor: number | null; status: string;
}

type BookingStep = "form" | "payment" | "confirmed";

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
  const [step, setStep] = useState<BookingStep>("form");
  const [recommendation, setRecommendation] = useState<{
    slot_id: string;
    slot_number: string;
    floor: number;
    location_name?: string;
    reason: string;
  } | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    supabase.from("parking_locations").select("*").eq("is_active", true)
      .then(({ data }) => setLocations(data || []));
  }, []);

  useEffect(() => {
    if (!selectedLocation) { setSlots([]); setRecommendation(null); return; }
    supabase.from("parking_slots").select("*").eq("location_id", selectedLocation).eq("status", "available")
      .then(({ data }) => setSlots(data || []));
  }, [selectedLocation]);

  // Fetch AI recommendation when location changes
  useEffect(() => {
    if (!selectedLocation) return;
    setRecommendation(null);
    setRecLoading(true);
    const durationHrs = startTime && endTime
      ? Math.max(1, Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / 3600000))
      : 1;
    supabase.functions
      .invoke("recommend-slot", { body: { location_id: selectedLocation, duration_hours: durationHrs } })
      .then(({ data }) => {
        if (data?.recommendation) setRecommendation(data.recommendation);
      })
      .finally(() => setRecLoading(false));
  }, [selectedLocation]);

  const selectedLoc = locations.find((l) => l.id === selectedLocation);

  const calculateAmount = () => {
    if (!startTime || !endTime || !selectedLoc) return 0;
    const hours = Math.max(1, Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / 3600000));
    return hours * selectedLoc.price_per_hour;
  };

  const UPI_ID = "amar07@ptaxis";

  const checkVehicleUniqueness = async (): Promise<boolean> => {
    const { data } = await supabase
      .from("bookings")
      .select("id")
      .eq("vehicle_number", vehicleNumber.trim().toUpperCase())
      .eq("status", "active")
      .limit(1);
    if (data && data.length > 0) {
      toast({
        title: "Vehicle already booked",
        description: "This vehicle number already has an active booking. Cancel or complete that booking first.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const VEHICLE_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!VEHICLE_REGEX.test(vehicleNumber)) {
      toast({ title: "Invalid vehicle number", description: "Use Indian format: MP20AB1234", variant: "destructive" });
      return;
    }
    const isUnique = await checkVehicleUniqueness();
    if (!isUnique) return;
    setStep("payment");
  };

  const handleConfirmPayment = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const amount = calculateAmount();
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        slot_id: selectedSlot,
        location_id: selectedLocation,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        total_amount: amount,
        status: "active",
        payment_status: "paid",
      });
      if (error) throw error;

      await supabase.from("parking_slots").update({ status: "reserved" }).eq("id", selectedSlot);

      setStep("confirmed");
      toast({ title: "Booking confirmed!", description: `Slot booked for ₹${amount}` });
    } catch (error: any) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Confirmed view
  if (step === "confirmed") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center animate-scale-in">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-2">Your parking slot has been reserved.</p>
              <p className="text-sm text-muted-foreground mb-6">Payment: ₹{calculateAmount()} via UPI</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/bookings")}>View Bookings</Button>
                <Button variant="outline" onClick={() => { setStep("form"); setSelectedSlot(""); setVehicleNumber(""); }}>
                  Book Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Payment view
  if (step === "payment") {
    const amount = calculateAmount();
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=SmartPark&am=${amount}&cu=INR&tn=Parking-Booking`;

    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" /> Complete Payment
            </h1>
            <p className="text-muted-foreground">Scan the QR code to pay via UPI</p>
          </div>

          <Card className="animate-scale-in">
            <CardContent className="pt-6 space-y-6">
              {/* Booking Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">{selectedLoc?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slot</span>
                  <span className="font-medium text-foreground">{slots.find(s => s.id === selectedSlot)?.slot_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-mono font-medium text-foreground">{vehicleNumber}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{amount}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-inner">
                  <QRCodeSVG
                    value={upiUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2 justify-center">
                    <QrCode className="h-4 w-4 text-primary" />
                    Scan with any UPI app
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">UPI ID: {UPI_ID}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleConfirmPayment} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Confirming..." : "I Have Paid"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By clicking "I Have Paid", you confirm that you have completed the UPI payment.
                Booking will not be confirmed without payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Form view
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
            <form onSubmit={handleProceedToPayment} className="space-y-5">
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

              {/* AI Recommendation */}
              {selectedLocation && (recLoading || recommendation) && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-3 animate-fade-in">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {recLoading ? (
                      <p className="text-sm text-muted-foreground">Finding the best slot for you…</p>
                    ) : recommendation ? (
                      <>
                        <p className="text-sm font-medium text-foreground">
                          Recommended Slot: {recommendation.slot_number}
                          {recommendation.location_name ? ` – ${recommendation.location_name}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{recommendation.reason}</p>
                        {selectedSlot !== recommendation.slot_id && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs"
                            onClick={() => setSelectedSlot(recommendation.slot_id)}
                          >
                            Use this slot
                          </Button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input
                  value={vehicleNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    if (val.length <= 10) setVehicleNumber(val);
                  }}
                  placeholder="MP20AB1234"
                  required
                  maxLength={10}
                />
                {vehicleNumber && !/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(vehicleNumber) && (
                  <p className="text-xs text-destructive">Format: MP20AB1234 (State code + District + Series + Number)</p>
                )}
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

              <Button type="submit" className="w-full" disabled={!selectedSlot || !vehicleNumber || !startTime || !endTime || !/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(vehicleNumber)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

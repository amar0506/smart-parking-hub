import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ParkingCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParkingSlot {
  id: string; slot_number: string; floor: number | null; status: string; location_id: string;
  parking_locations: { name: string } | null;
}

export default function AdminSlots() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ location_id: "", slot_number: "", floor: "1" });

  const fetchSlots = async () => {
    const { data } = await supabase.from("parking_slots").select("*, parking_locations(name)").order("created_at", { ascending: false });
    setSlots((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
    supabase.from("parking_locations").select("id, name").then(({ data }) => setLocations(data || []));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("parking_slots").insert({
      location_id: form.location_id,
      slot_number: form.slot_number,
      floor: parseInt(form.floor),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added!" });
      setDialogOpen(false);
      setForm({ location_id: "", slot_number: "", floor: "1" });
      fetchSlots();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("parking_slots").delete().eq("id", id);
    toast({ title: "Slot deleted" });
    fetchSlots();
  };

  const statusColor = (s: string) => {
    if (s === "available") return "bg-accent/10 text-accent border-accent/20";
    if (s === "occupied") return "bg-destructive/10 text-destructive border-destructive/20";
    if (s === "reserved") return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ParkingCircle className="h-6 w-6 text-primary" /> Manage Slots
            </h1>
            <p className="text-muted-foreground">Add and manage parking slots</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Parking Slot</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slot Number</Label>
                    <Input value={form.slot_number} onChange={(e) => setForm({ ...form, slot_number: e.target.value })} placeholder="A1" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Slot</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : slots.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No slots yet. Add locations first, then add slots.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {slots.map((s) => (
              <Card key={s.id} className="animate-fade-in">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-foreground">Slot {s.slot_number} — Floor {s.floor || 1}</p>
                      <p className="text-sm text-muted-foreground">{s.parking_locations?.name || "Unknown"}</p>
                    </div>
                    <Badge variant="outline" className={statusColor(s.status)}>{s.status}</Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

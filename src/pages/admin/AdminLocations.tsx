import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParkingLocation {
  id: string; name: string; address: string; lat: number; lng: number; total_slots: number; price_per_hour: number; is_active: boolean | null;
}

export default function AdminLocations() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", lat: "24.5726", lng: "80.8322", total_slots: "20", price_per_hour: "20" });

  const fetchLocations = async () => {
    const { data } = await supabase.from("parking_locations").select("*").order("created_at", { ascending: false });
    setLocations(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("parking_locations").insert({
      name: form.name,
      address: form.address,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      total_slots: parseInt(form.total_slots),
      price_per_hour: parseFloat(form.price_per_hour),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Location added!" });
      setDialogOpen(false);
      setForm({ name: "", address: "", lat: "24.5726", lng: "80.8322", total_slots: "20", price_per_hour: "20" });
      fetchLocations();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("parking_locations").delete().eq("id", id);
    toast({ title: "Location deleted" });
    fetchLocations();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" /> Manage Locations
            </h1>
            <p className="text-muted-foreground">Add and manage parking locations in Satna</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Location</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Parking Location</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="City Center Parking" required />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Main Road, Satna" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Slots</Label>
                    <Input type="number" value={form.total_slots} onChange={(e) => setForm({ ...form, total_slots: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Price/Hour (₹)</Label>
                    <Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Location</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : locations.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No locations yet. Click "Add Location" to get started.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {locations.map((loc) => (
              <Card key={loc.id} className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{loc.name}</h3>
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {loc.total_slots} slots • ₹{loc.price_per_hour}/hr • ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(loc.id)}>
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

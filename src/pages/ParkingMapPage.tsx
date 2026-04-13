import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Car } from "lucide-react";
import { Link } from "react-router-dom";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// India center coordinates
const INDIA_CENTER: [number, number] = [22.5937, 78.9629];

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  total_slots: number;
  price_per_hour: number;
  is_active: boolean | null;
}

export default function ParkingMapPage() {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("parking_locations").select("*").eq("is_active", true);
      setLocations(data || []);
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" /> Parking Map
            </h1>
            <p className="text-muted-foreground">Find parking locations near you</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <MapContainer center={INDIA_CENTER} zoom={5} className="h-full w-full" scrollWheelZoom>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    {filtered.map((loc) => (
                      <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                        <Popup>
                          <div className="text-sm">
                            <strong>{loc.name}</strong>
                            <p>{loc.address}</p>
                            <p>Slots: {loc.total_slots} | ₹{loc.price_per_hour}/hr</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location list */}
          <div className="space-y-4 max-h-[500px] overflow-auto">
            {loading ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No parking locations found.</CardContent></Card>
            ) : (
              filtered.map((loc) => (
                <Card key={loc.id} className="hover:shadow-md transition-shadow animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      {loc.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{loc.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{loc.total_slots} slots • ₹{loc.price_per_hour}/hr</span>
                      <Link to={`/book?location=${loc.id}`}>
                        <Button size="sm">Book</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

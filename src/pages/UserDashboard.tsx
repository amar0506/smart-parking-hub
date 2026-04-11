import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin, CalendarDays, Clock } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeBookings: 0, totalBookings: 0, locations: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const [bookingsRes, activeRes, locRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
        supabase.from("parking_locations").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalBookings: bookingsRes.count || 0,
        activeBookings: activeRes.count || 0,
        locations: locRes.count || 0,
      });
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { title: "Active Bookings", value: stats.activeBookings, icon: Clock, color: "text-primary" },
    { title: "Total Bookings", value: stats.totalBookings, icon: CalendarDays, color: "text-accent" },
    { title: "Parking Locations", value: stats.locations, icon: MapPin, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="animate-slide-up hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="/map" className="stat-card text-center hover:border-primary/30 transition-colors">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground">Find Parking</p>
              </a>
              <a href="/book" className="stat-card text-center hover:border-primary/30 transition-colors">
                <CalendarDays className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-medium text-foreground">Book a Slot</p>
              </a>
              <a href="/parking-3d" className="stat-card text-center hover:border-primary/30 transition-colors">
                <Car className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="font-medium text-foreground">3D View</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin, CalendarDays, Clock, CreditCard, ParkingCircle, History, BarChart3 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeBookings: 0, totalBookings: 0, locations: 0, paidAmount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const [bookingsRes, activeRes, locRes, paidRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
        supabase.from("parking_locations").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("total_amount").eq("user_id", user.id).eq("payment_status", "paid"),
      ]);
      const totalPaid = (paidRes.data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
      setStats({
        totalBookings: bookingsRes.count || 0,
        activeBookings: activeRes.count || 0,
        locations: locRes.count || 0,
        paidAmount: totalPaid,
      });
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { title: "Active Bookings", value: stats.activeBookings, icon: Clock, color: "text-primary" },
    { title: "Total Bookings", value: stats.totalBookings, icon: CalendarDays, color: "text-accent" },
    { title: "Parking Locations", value: stats.locations, icon: MapPin, color: "text-warning" },
    { title: "Total Spent", value: `₹${stats.paidAmount}`, icon: CreditCard, color: "text-info" },
  ];

  const quickActions = [
    { title: "Find Parking", desc: "Browse map for spots", icon: MapPin, href: "/map", color: "text-primary" },
    { title: "Book a Slot", desc: "Reserve your space", icon: CalendarDays, href: "/book", color: "text-accent" },
    { title: "My Bookings", desc: "View active bookings", icon: Car, href: "/bookings", color: "text-warning" },
    { title: "3D View", desc: "Interactive visualization", icon: ParkingCircle, href: "/parking-3d", color: "text-info" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <BarChart3 className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href} className="stat-card text-center hover:border-primary/30 transition-colors group">
                  <action.icon className={`h-8 w-8 ${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

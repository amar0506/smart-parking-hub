import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Car, MapPin, Users, CalendarDays, TrendingUp, CreditCard, ParkingCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ locations: 0, slots: 0, bookings: 0, activeBookings: 0, users: 0, revenue: 0 });
  const [bookingData, setBookingData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [locRes, slotRes, bookRes, activeRes, usersRes, revenueRes] = await Promise.all([
        supabase.from("parking_locations").select("id", { count: "exact", head: true }),
        supabase.from("parking_slots").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("total_amount").eq("payment_status", "paid"),
      ]);
      const totalRevenue = (revenueRes.data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
      setStats({
        locations: locRes.count || 0,
        slots: slotRes.count || 0,
        bookings: bookRes.count || 0,
        activeBookings: activeRes.count || 0,
        users: usersRes.count || 0,
        revenue: totalRevenue,
      });

      setBookingData([
        { day: "Mon", bookings: 12, revenue: 240 }, { day: "Tue", bookings: 19, revenue: 380 },
        { day: "Wed", bookings: 8, revenue: 160 }, { day: "Thu", bookings: 15, revenue: 300 },
        { day: "Fri", bookings: 22, revenue: 440 }, { day: "Sat", bookings: 28, revenue: 560 },
        { day: "Sun", bookings: 18, revenue: 360 },
      ]);
    };
    fetchData();
  }, []);

  const pieData = [
    { name: "Available", value: Math.max(1, stats.slots - stats.activeBookings), color: "hsl(142, 71%, 45%)" },
    { name: "Occupied", value: stats.activeBookings || 1, color: "hsl(0, 84%, 60%)" },
  ];

  const statCards = [
    { title: "Locations", value: stats.locations, icon: MapPin, color: "text-primary" },
    { title: "Total Slots", value: stats.slots, icon: ParkingCircle, color: "text-accent" },
    { title: "Total Users", value: stats.users, icon: Users, color: "text-info" },
    { title: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-warning" },
    { title: "Active Now", value: stats.activeBookings, icon: TrendingUp, color: "text-primary" },
    { title: "Revenue", value: `₹${stats.revenue}`, icon: CreditCard, color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Overview of parking system analytics</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <Card key={s.title} className="animate-slide-up hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Bookings & Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slot Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Car, MapPin, Users, CalendarDays, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ locations: 0, slots: 0, bookings: 0, activeBookings: 0 });
  const [bookingData, setBookingData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [locRes, slotRes, bookRes, activeRes] = await Promise.all([
        supabase.from("parking_locations").select("id", { count: "exact", head: true }),
        supabase.from("parking_slots").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats({
        locations: locRes.count || 0,
        slots: slotRes.count || 0,
        bookings: bookRes.count || 0,
        activeBookings: activeRes.count || 0,
      });

      // Mock chart data for demo
      setBookingData([
        { day: "Mon", bookings: 12 }, { day: "Tue", bookings: 19 },
        { day: "Wed", bookings: 8 }, { day: "Thu", bookings: 15 },
        { day: "Fri", bookings: 22 }, { day: "Sat", bookings: 28 },
        { day: "Sun", bookings: 18 },
      ]);
    };
    fetch();
  }, []);

  const pieData = [
    { name: "Available", value: Math.max(1, stats.slots - stats.activeBookings), color: "hsl(142, 71%, 45%)" },
    { name: "Occupied", value: stats.activeBookings || 1, color: "hsl(0, 84%, 60%)" },
  ];

  const statCards = [
    { title: "Locations", value: stats.locations, icon: MapPin, color: "text-primary" },
    { title: "Total Slots", value: stats.slots, icon: Car, color: "text-accent" },
    { title: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-warning" },
    { title: "Active Bookings", value: stats.activeBookings, icon: TrendingUp, color: "text-info" },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.title} className="animate-slide-up hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slot Availability</CardTitle>
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

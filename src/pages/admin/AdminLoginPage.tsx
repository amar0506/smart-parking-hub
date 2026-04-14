import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Lock, BarChart3, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Admin access granted", description: "Welcome to the admin panel." });
      navigate("/admin");
    } catch (error: any) {
      toast({ title: "Access denied", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dark themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,20%,5%)] via-[hsl(220,20%,8%)] to-[hsl(220,20%,5%)]" />
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-warning/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Floating admin icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Shield className="absolute top-[20%] left-[8%] h-10 w-10 text-primary/10 animate-float" />
        <BarChart3 className="absolute top-[15%] right-[12%] h-8 w-8 text-primary/10 animate-float" style={{ animationDelay: "1s" }} />
        <Users className="absolute bottom-[25%] left-[15%] h-8 w-8 text-primary/8 animate-float" style={{ animationDelay: "2s" }} />
        <Settings className="absolute bottom-[15%] right-[10%] h-10 w-10 text-primary/8 animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Admin login card */}
      <div className="w-full max-w-md mx-4 relative z-10 animate-scale-in">
        <div className="bg-[hsl(220,20%,10%)]/80 backdrop-blur-2xl border border-primary/10 rounded-3xl shadow-2xl shadow-primary/5 p-8">
          {/* Admin badge */}
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Lock className="h-3 w-3" /> Admin Access
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 border border-primary/20">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(210,40%,98%)]">Admin Panel</h1>
            <p className="text-[hsl(215,20%,55%)] mt-1">SmartPark Management Console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[hsl(210,40%,90%)]">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartpark.com"
                required
                className="h-12 bg-[hsl(220,20%,14%)] border-[hsl(220,20%,20%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)] rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[hsl(210,40%,90%)]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 bg-[hsl(220,20%,14%)] border-[hsl(220,20%,20%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)] rounded-xl focus:ring-2 focus:ring-primary/30 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)] hover:text-[hsl(210,40%,90%)] transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/10 hover:shadow-xl transition-all" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Access Admin Panel
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[hsl(215,20%,50%)] hover:text-primary transition-colors">
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Reset link sent", description: "Check your inbox for the reset email." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10 animate-scale-in">
        <div className="bg-card/70 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl shadow-primary/5 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              {sent ? <CheckCircle2 className="h-8 w-8 text-primary-foreground" /> : <Mail className="h-8 w-8 text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {sent
                ? `We sent a password reset link to ${email}`
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 bg-background/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full h-12 rounded-xl"
              >
                Try Another Email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldQuestion, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "question" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_security_question", { _email: email });
      if (error) throw error;
      if (!data) {
        toast({
          title: "Account not found",
          description: "No account with that email or no security question is set.",
          variant: "destructive",
        });
        return;
      }
      setQuestion(data as string);
      setStep("question");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password-security", {
        body: { email, answer, newPassword },
      });
      if (error) {
        // Try to extract API error message
        const ctx: any = (error as any).context;
        let msg = error.message;
        try {
          const body = ctx && (await ctx.json?.());
          if (body?.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      setStep("done");
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
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
              {step === "done" ? (
                <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
              ) : (
                <ShieldQuestion className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === "email" && "Forgot Password?"}
              {step === "question" && "Security Check"}
              {step === "done" && "Password Updated"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {step === "email" && "Enter your registered email to begin."}
              {step === "question" && "Answer your security question to reset your password."}
              {step === "done" && "Redirecting you to sign in..."}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "Checking..." : "Continue"}
              </Button>
            </form>
          )}

          {step === "question" && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Security Question</Label>
                <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm">
                  {question}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-background/50 border-border/50 rounded-xl pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
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

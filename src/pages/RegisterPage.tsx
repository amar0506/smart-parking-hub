import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      toast({ title: "Security answer required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName, securityQuestion, securityAnswer);
      toast({ title: "Account created!", description: "You can now sign in." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10 animate-scale-in">
        <div className="bg-card/70 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl shadow-accent/5 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30">
              <UserPlus className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-1">Join SmartPark to start booking parking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="h-12 bg-background/50 border-border/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 bg-background/50 border-border/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-12 bg-background/50 border-border/50 rounded-xl pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-question">Security Question</Label>
              <Select value={securityQuestion} onValueChange={setSecurityQuestion}>
                <SelectTrigger id="security-question" className="h-12 bg-background/50 border-border/50 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_QUESTIONS.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-answer">Security Answer</Label>
              <Input
                id="security-answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Your answer"
                required
                className="h-12 bg-background/50 border-border/50 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">You'll need this to recover your password. It is case-insensitive.</p>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

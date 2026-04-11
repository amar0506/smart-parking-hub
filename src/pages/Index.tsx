import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Map, Shield, Zap, ArrowRight, ParkingCircle, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Car className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">SmartPark</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button>Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Login</Button></Link>
                <Link to="/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            Smart Parking for Satna, Madhya Pradesh
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
            Find & Book Parking<br />
            <span className="text-primary">In Seconds</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Real-time parking availability, interactive maps, and instant booking. 
            Never circle the block looking for parking again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Parking Smart <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/map">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Map className="mr-2 h-5 w-5" /> View Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-card/50">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[
            { label: "Parking Locations", value: "15+" },
            { label: "Slots Available", value: "500+" },
            { label: "Happy Users", value: "2K+" },
            { label: "Bookings Made", value: "10K+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why SmartPark?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Map, title: "Interactive Map", desc: "Find parking spots on a live map of Satna with real-time availability." },
              { icon: ParkingCircle, title: "3D Visualization", desc: "See a realistic 3D view of parking lots with animated car movements." },
              { icon: Shield, title: "Secure Booking", desc: "Book your slot in advance with guaranteed reservation and easy cancellation." },
            ].map((f) => (
              <div key={f.title} className="stat-card group hover:border-primary/30 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-card/50 border-y border-border/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Search Location", desc: "Browse the map or search for parking near you in Satna." },
              { step: "2", title: "Choose a Slot", desc: "Pick an available slot, check pricing, and select your time." },
              { step: "3", title: "Book & Park", desc: "Confirm your booking and head straight to your reserved spot." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">About SmartPark</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            SmartPark is a smart parking management system designed for Satna, Madhya Pradesh, India.
            Our platform uses real-time data and interactive maps to help drivers find, book, and manage
            parking spaces efficiently. Built as a professional demonstration of modern web technologies.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SmartPark — Smart Parking Finder for Satna, MP, India</p>
        </div>
      </footer>
    </div>
  );
}

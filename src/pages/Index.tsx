import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Map, Shield, Zap, ArrowRight, ParkingCircle, MapPin, CreditCard, BarChart3, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
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
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            Smart Parking Management System
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
            Find & Book Parking<br />
            <span className="text-primary">In Seconds</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Real-time parking availability, interactive maps, 3D visualization, and instant UPI booking. 
            The complete smart parking solution.
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
            { label: "Parking Locations", value: "15+", icon: MapPin },
            { label: "Slots Available", value: "500+", icon: ParkingCircle },
            { label: "Happy Users", value: "2K+", icon: Shield },
            { label: "Bookings Made", value: "10K+", icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Why SmartPark?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">Advanced features for a seamless parking experience</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Map, title: "Interactive Map", desc: "Find parking spots on a live map with real-time availability and navigation." },
              { icon: ParkingCircle, title: "3D Visualization", desc: "See a realistic 3D view of parking lots with animated car movements and slot status." },
              { icon: Shield, title: "Secure Booking", desc: "Book your slot with UPI payment, guaranteed reservation and easy cancellation." },
              { icon: CreditCard, title: "UPI Payment", desc: "Seamless UPI-based payment integration with QR code scanning for instant booking." },
              { icon: BarChart3, title: "Smart Analytics", desc: "Real-time occupancy analytics, usage trends, and intelligent slot recommendations." },
              { icon: Clock, title: "Reservation Timer", desc: "Time-based reservations with automatic slot release and extension options." },
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
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Search Location", desc: "Browse the map or search for parking near your destination." },
              { step: "2", title: "Choose a Slot", desc: "Pick an available slot, check pricing, and select your time." },
              { step: "3", title: "Pay via UPI", desc: "Scan the QR code and complete payment instantly via UPI." },
              { step: "4", title: "Park & Go", desc: "Booking confirmed! Head straight to your reserved parking spot." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
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
            SmartPark is an advanced smart parking management system designed for modern cities.
            Our platform uses real-time data, interactive maps, 3D visualization, and UPI payments to help drivers find, book, and manage
            parking spaces efficiently. Built with cutting-edge web technologies for a seamless experience.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SmartPark — Smart Parking Management System</p>
        </div>
      </footer>
    </div>
  );
}

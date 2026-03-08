import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    if (error?.code === "23505") {
      toast({ title: "Already subscribed!", description: "You're already on our newsletter." });
    } else if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Subscribed! 🎉", description: "Thank you for subscribing to our newsletter." });
      setEmail("");
    }
    setSubscribing(false);
  };

  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      {/* Newsletter strip */}
      <div className="bg-primary">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-primary-foreground">
            <Mail className="h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-display font-bold text-sm">Subscribe to our Newsletter</h4>
              <p className="text-xs text-primary-foreground/70">Get exclusive deals, new arrivals and discount coupons!</p>
            </div>
          </div>
          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              className="w-full md:w-64 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-9"
              required
            />
            <Button type="submit" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0" disabled={subscribing}>
              <Send className="h-4 w-4 mr-1" /> Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-lg font-bold text-background mb-3">
              Pak<span className="text-accent">Mart</span>
            </h3>
            <p className="text-xs leading-relaxed mb-4">
              Pakistan's trusted online marketplace. Quality products at unbeatable prices with fast delivery across Pakistan.
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="h-8 w-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-background text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/cart" className="hover:text-accent transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-accent transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-accent transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-background text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li>Help Center</li>
              <li>Returns & Refunds</li>
              <li>Shipping Info</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-background text-sm mb-3">Contact Us</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /> support@pakmart.pk</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /> +92 307 2560758</li>
              <li className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between text-xs text-background/40 gap-2">
          <span>© 2026 PakMart. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Cash on Delivery Available</span>
            <span>•</span>
            <span>Easy Returns</span>
            <span>•</span>
            <span>100% Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

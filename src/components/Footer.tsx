import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold mb-3">
              Pak<span className="text-accent">Mart</span>
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Your trusted online marketplace. Quality products at the best prices.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/cart" className="hover:text-accent transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-accent transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Help Center</li>
              <li>Returns & Refunds</li>
              <li>Shipping Info</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>support@pakmart.pk</li>
              <li>+92 307 2560758</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
          © 2026 PakMart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

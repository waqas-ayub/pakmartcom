import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Shield, Package, LogOut, Heart, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category { id: string; name: string; }

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuthContext();
  const { count: wishlistCount } = useWishlist();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCategories(data || []));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/?search=${encodeURIComponent(search.trim())}`); setMobileMenuOpen(false); }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-accent text-accent-foreground text-center text-xs py-1.5 font-medium">
        🚚 Free Delivery on orders above Rs. 5,000 | 🎉 Up to 50% OFF on selected items!
      </div>

      {/* Main nav */}
      <div className="bg-gradient-topbar text-primary-foreground shadow-md">
        <div className="container flex items-center justify-between h-14 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-xl font-extrabold tracking-tight">
              Pak<span className="text-accent">Mart</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full pr-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:bg-primary-foreground/20 h-10"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-accent text-accent-foreground rounded-r-md hover:bg-accent/90 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="h-4 w-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="h-4 w-4 mr-2" /> Wishlist ({wishlistCount})
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 text-xs" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-1" /> Sign In
              </Button>
            )}

            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden md:block bg-card border-b">
        <div className="container flex items-center gap-6 h-10 text-xs font-medium">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/?category=${cat.id}`}
              className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b p-4 animate-fade-in space-y-3">
          <form onSubmit={handleSearch}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full" />
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { user, loading: authLoading } = useAuthContext();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user && wishlistIds.size > 0) fetchProducts();
    else if (user) setLoading(false);
  }, [user, authLoading, wishlistIds]);

  async function fetchProducts() {
    const ids = Array.from(wishlistIds);
    const { data } = await supabase.from("products").select("*").in("id", ids);
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold mb-6">My Wishlist ({wishlistIds.size})</h1>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">Your wishlist is empty</p>
            <p className="text-muted-foreground text-sm mb-4">Save products you love for later</p>
            <Link to="/"><Button>Browse Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}

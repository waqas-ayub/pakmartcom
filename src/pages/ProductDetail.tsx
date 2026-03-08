import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, ChevronLeft, Minus, Plus, Loader2, Heart, Star, Truck, Shield, Undo2 } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string; name: string; description: string; price: number; sale_price: number | null;
  image_url: string; images: string[]; stock: number; category_id: string | null;
  categories?: { name: string } | null;
}
interface Review { id: string; user_name: string; rating: number; comment: string; created_at: string; user_id: string; }

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuthContext();

  useEffect(() => {
    if (id) { fetchProduct(id); fetchReviews(id); }
  }, [id]);

  async function fetchProduct(productId: string) {
    setLoading(true);
    const { data } = await supabase.from("products").select("*, categories(name)").eq("id", productId).single();
    setProduct(data as any);
    setLoading(false);
    if (data?.category_id) {
      const { data: related } = await supabase.from("products").select("*").eq("category_id", data.category_id).neq("id", productId).limit(5);
      setRelatedProducts(related || []);
    }
  }

  async function fetchReviews(productId: string) {
    const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
  }

  async function submitReview() {
    if (!user || !id) return;
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: id, user_id: user.id, user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      rating: reviewRating, comment: reviewText,
    });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ title: "Review submitted! ⭐" }); setReviewText(""); fetchReviews(id); }
    setSubmittingReview(false);
  }

  if (loading) return <Layout><div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!product) return <Layout><div className="container py-20 text-center"><h1 className="font-display text-2xl font-bold mb-4">Product Not Found</h1><Link to="/" className="text-primary underline">Back to Home</Link></div></Layout>;

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const wishlisted = isInWishlist(product.id);

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3 border">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors shrink-0 ${i === selectedImage ? "border-primary" : "border-border"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {product.categories && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{product.categories.name}</span>}
            <h1 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-2">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}</div>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              {product.sale_price ? (
                <>
                  <span className="font-display text-3xl font-extrabold text-primary">Rs. {product.sale_price.toLocaleString()}</span>
                  <span className="text-lg text-muted-foreground line-through">Rs. {product.price.toLocaleString()}</span>
                  <span className="sale-badge">-{discount}%</span>
                </>
              ) : (
                <span className="font-display text-3xl font-extrabold text-primary">Rs. {product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className={product.stock > 0 ? "text-pakmart-success font-medium" : "text-destructive font-medium"}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button size="lg" className="flex-1 font-display font-bold" onClick={() => { for (let i = 0; i < quantity; i++) addItem({ id: product.id, name: product.name, price: product.price, sale_price: product.sale_price, image_url: product.image_url, stock: product.stock }); }}>
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => user ? toggleWishlist(product.id) : undefined}>
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
              {[{ icon: Truck, text: "Free Delivery" }, { icon: Undo2, text: "Easy Returns" }, { icon: Shield, text: "Genuine Product" }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-6">Customer Reviews ({reviews.length})</h2>

          {user && (
            <div className="bg-card border rounded-xl p-5 mb-6">
              <h3 className="font-display font-semibold text-sm mb-3">Write a Review</h3>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setReviewRating(r)}>
                    <Star className={`h-5 w-5 transition-colors ${r <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." rows={3} className="mb-3" />
              <Button size="sm" disabled={!reviewText.trim() || submittingReview} onClick={submitReview}>
                {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Submit Review
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No reviews yet. Be the first to review!</p>
            ) : reviews.map((r) => (
              <div key={r.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{r.user_name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-sm">{r.user_name}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}</div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

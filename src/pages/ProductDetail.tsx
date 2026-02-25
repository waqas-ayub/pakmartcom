import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ChevronLeft, Minus, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  images: string[];
  stock: number;
  category_id: string | null;
  categories?: { name: string } | null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  async function fetchProduct(productId: string) {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", productId)
      .single();
    setProduct(data as any);
    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/" className="text-primary underline">Back to Home</Link>
        </div>
      </Layout>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        image_url: product.image_url,
        stock: product.stock,
      });
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {product.categories && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{product.categories.name}</span>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-3">{product.name}</h1>

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
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="lg" className="flex-1 font-display font-bold" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

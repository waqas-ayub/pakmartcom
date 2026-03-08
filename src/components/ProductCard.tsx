import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  stock: number;
  rating?: number;
  review_count?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-lg border overflow-hidden shadow-product hover:shadow-product-hover transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 sale-badge">{discount}% OFF</span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-4 py-2 rounded text-sm">Out of Stock</span>
          </div>
        )}
        {/* Quick wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) { navigate("/auth"); return; }
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating!) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">({product.review_count || 0})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          {product.sale_price ? (
            <>
              <span className="font-display font-bold text-base text-primary">Rs. {product.sale_price.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground line-through">Rs. {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-display font-bold text-base text-primary">Rs. {product.price.toLocaleString()}</span>
          )}
        </div>
        <Button
          size="sm"
          className="w-full h-8 text-xs"
          disabled={product.stock <= 0}
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              sale_price: product.sale_price,
              image_url: product.image_url,
              stock: product.stock,
            });
          }}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

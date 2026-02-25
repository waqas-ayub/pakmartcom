import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

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
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 sale-badge">{discount}% OFF</span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-4 py-2 rounded">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          {product.sale_price ? (
            <>
              <span className="font-display font-bold text-lg text-primary">Rs. {product.sale_price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground line-through">Rs. {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-display font-bold text-lg text-primary">Rs. {product.price.toLocaleString()}</span>
          )}
        </div>
        <Button
          size="sm"
          className="w-full"
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
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

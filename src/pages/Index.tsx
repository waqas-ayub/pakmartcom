import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-banner.jpg";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  stock: number;
  category_id: string | null;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchData();
  }, [searchQuery, activeCategory]);

  async function fetchData() {
    setLoading(true);
    const [catRes, prodQuery] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      buildProductQuery(),
    ]);
    setCategories((catRes.data as Category[]) || []);
    setProducts((prodQuery.data as Product[]) || []);
    setLoading(false);
  }

  async function buildProductQuery() {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
    if (activeCategory) query = query.eq("category_id", activeCategory);
    return query;
  }

  const featuredProducts = products.filter((p) => p.featured);

  return (
    <Layout>
      {/* Hero */}
      {!searchQuery && !activeCategory && (
        <section className="relative overflow-hidden">
          <div className="relative h-[320px] md:h-[420px]">
            <img src={heroImage} alt="PakMart — Your trusted marketplace" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-lg"
                >
                  <h1 className="font-display text-3xl md:text-5xl font-extrabold text-card mb-3 leading-tight">
                    Shop the Best<br />
                    <span className="text-accent">Deals Today</span>
                  </h1>
                  <p className="text-card/80 mb-5 text-sm md:text-base">
                    Discover quality products at unbeatable prices. Fast delivery across Pakistan.
                  </p>
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-display font-bold" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
                    Shop Now <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container py-8" id="products">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <Button
            variant={!activeCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-muted-foreground mb-4">
            Results for "<span className="font-semibold text-foreground">{searchQuery}</span>"
          </p>
        )}

        {/* Featured */}
        {!searchQuery && !activeCategory && featuredProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4">⭐ Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4">
            {activeCategory ? categories.find((c) => c.id === activeCategory)?.name : "All Products"}
          </h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

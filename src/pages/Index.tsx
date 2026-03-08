import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-banner.jpg";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronRight, Loader2, Star, Truck, Shield, Undo2, TrendingUp, Percent, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string; name: string; price: number; sale_price: number | null;
  image_url: string; stock: number; category_id: string | null; featured: boolean;
  rating?: number; review_count?: number;
}

interface Category { id: string; name: string; description: string; image_url: string | null; }

const TESTIMONIALS = [
  { name: "Ahmed Khan", city: "Lahore", text: "Best online shopping experience in Pakistan! Fast delivery and genuine products.", rating: 5 },
  { name: "Sara Malik", city: "Karachi", text: "I love the variety and prices. Customer service is very helpful too!", rating: 5 },
  { name: "Usman Ali", city: "Islamabad", text: "Great quality products at amazing prices. Highly recommended for everyone.", rating: 4 },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "";
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[string, string]>(["", ""]);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { fetchData(); }, [searchQuery, activeCategory, sortBy, page]);

  async function fetchData() {
    setLoading(true);
    const [catRes, prodRes, reviewRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      buildProductQuery(),
      supabase.from("reviews").select("product_id, rating"),
    ]);
    setCategories((catRes.data as Category[]) || []);

    // Calculate avg ratings
    const reviewMap: Record<string, { sum: number; count: number }> = {};
    (reviewRes.data || []).forEach((r: any) => {
      if (!reviewMap[r.product_id]) reviewMap[r.product_id] = { sum: 0, count: 0 };
      reviewMap[r.product_id].sum += r.rating;
      reviewMap[r.product_id].count += 1;
    });

    const prods = ((prodRes.data as Product[]) || []).map((p) => ({
      ...p,
      rating: reviewMap[p.id] ? reviewMap[p.id].sum / reviewMap[p.id].count : 0,
      review_count: reviewMap[p.id]?.count || 0,
    }));
    setProducts(prods);
    setLoading(false);
  }

  async function buildProductQuery() {
    let query = supabase.from("products").select("*");
    if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
    if (activeCategory) query = query.eq("category_id", activeCategory);
    if (priceRange[0]) query = query.gte("price", Number(priceRange[0]));
    if (priceRange[1]) query = query.lte("price", Number(priceRange[1]));

    if (sortBy === "price_low") query = query.order("price", { ascending: true });
    else if (sortBy === "price_high") query = query.order("price", { ascending: false });
    else if (sortBy === "name") query = query.order("name", { ascending: true });
    else query = query.order("created_at", { ascending: false });

    return query.range((page - 1) * perPage, page * perPage - 1);
  }

  const setCategory = (catId: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (catId) p.set("category", catId); else p.delete("category");
    p.delete("search");
    setSearchParams(p);
    setPage(1);
  };

  const featuredProducts = products.filter((p) => p.featured);
  const discountProducts = products.filter((p) => p.sale_price && p.sale_price < p.price);
  const showHomeSections = !searchQuery && !activeCategory;

  return (
    <Layout>
      {/* Hero */}
      {showHomeSections && (
        <section className="relative overflow-hidden">
          <div className="relative h-[280px] md:h-[400px]">
            <img src={heroImage} alt="PakMart — Your trusted marketplace" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="max-w-lg">
                  <h1 className="font-display text-3xl md:text-5xl font-extrabold text-card mb-3 leading-tight">
                    Shop the Best<br /><span className="text-accent">Deals Today</span>
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

      {/* Trust bar */}
      {showHomeSections && (
        <section className="border-b bg-card">
          <div className="container py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Free Delivery", desc: "Orders over Rs.5,000" },
              { icon: Undo2, label: "Easy Returns", desc: "7-day return policy" },
              { icon: Shield, label: "Secure Payment", desc: "100% secure checkout" },
              { icon: Star, label: "Top Quality", desc: "Genuine products only" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xs font-bold">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Grid */}
      {showHomeSections && categories.length > 0 && (
        <section className="container py-8">
          <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="bg-card border rounded-lg p-4 text-center hover:border-primary hover:shadow-product-hover transition-all group"
              >
                <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-lg">
                    {cat.name === "Electronics" ? "📱" : cat.name === "Clothing" ? "👕" : cat.name === "Fashion" ? "👗" : cat.name === "Home & Kitchen" ? "🏠" : cat.name === "Books" ? "📚" : "⚽"}
                  </span>
                </div>
                <p className="font-display text-xs font-semibold line-clamp-1">{cat.name}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="container py-6" id="products">
        {/* Promo banners */}
        {showHomeSections && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-wide text-accent mb-1">Limited Time</p>
              <h3 className="font-display text-xl font-extrabold mb-1">Up to 50% OFF</h3>
              <p className="text-xs text-primary-foreground/70 mb-3">On Electronics & Gadgets</p>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs" onClick={() => setCategory(categories.find(c => c.name === "Electronics")?.id || null)}>
                Shop Now <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="bg-gradient-to-r from-accent to-accent/80 rounded-xl p-6 text-accent-foreground">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">New Arrivals</p>
              <h3 className="font-display text-xl font-extrabold mb-1">Fashion Collection</h3>
              <p className="text-xs text-accent-foreground/70 mb-3">Latest trends at best prices</p>
              <Button size="sm" variant="secondary" className="text-xs" onClick={() => setCategory(categories.find(c => c.name === "Fashion")?.id || null)}>
                Explore <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
            <Button variant={!activeCategory ? "default" : "outline"} size="sm" onClick={() => setCategory(null)} className="shrink-0 text-xs h-8">
              All
            </Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setCategory(cat.id)} className="shrink-0 text-xs h-8">
                {cat.name}
              </Button>
            ))}
          </div>
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground">Price:</span>
          <Input type="number" placeholder="Min" value={priceRange[0]} onChange={(e) => setPriceRange([e.target.value, priceRange[1]])} className="w-24 h-8 text-xs" />
          <span className="text-muted-foreground">—</span>
          <Input type="number" placeholder="Max" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], e.target.value])} className="w-24 h-8 text-xs" />
          <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => { setPage(1); fetchData(); }}>Apply</Button>
        </div>

        {searchQuery && (
          <p className="text-muted-foreground mb-4 text-sm">
            Results for "<span className="font-semibold text-foreground">{searchQuery}</span>"
          </p>
        )}

        {/* Featured */}
        {showHomeSections && featuredProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Featured Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredProducts.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Discount Products */}
        {showHomeSections && discountProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Percent className="h-5 w-5 text-destructive" /> Hot Deals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {discountProducts.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <h2 className="font-display text-lg font-bold mb-4">
            {activeCategory ? categories.find((c) => c.id === activeCategory)?.name || "Products" : "All Products"}
          </h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {products.length >= perPage && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </section>
      </div>

      {/* Testimonials */}
      {showHomeSections && (
        <section className="bg-muted py-12">
          <div className="container">
            <h2 className="font-display text-xl font-bold text-center mb-8">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-product">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < t.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                  <div>
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

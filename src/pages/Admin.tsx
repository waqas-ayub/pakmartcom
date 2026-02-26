import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  stock: number;
  featured: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  phone: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; price: number }[];
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin, authLoading]);

  async function fetchAll() {
    const [prodRes, catRes, orderRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    ]);
    setProducts((prodRes.data as Product[]) || []);
    setCategories((catRes.data as Category[]) || []);
    setOrders((orderRes.data as any) || []);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchAll();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast({ title: "Order status updated" });
    fetchAll();
  }

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><ShoppingBag className="h-4 w-4 mr-1" /> Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" /> Orders ({orders.length})</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {view === "list" ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-semibold">Your Products</h2>
                  <Button onClick={() => { setEditingProduct(null); setView("add"); }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No products yet</p>
                    <p className="text-sm text-muted-foreground/70 mb-4">Start by adding your first product</p>
                    <Button onClick={() => { setEditingProduct(null); setView("add"); }}>
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Rs. {p.price.toLocaleString()}</span>
                            {p.sale_price && <span className="text-destructive">→ Rs. {p.sale_price.toLocaleString()}</span>}
                            <span>•</span>
                            <span>{p.stock} in stock</span>
                            {p.featured && <span>• ⭐</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setView("edit"); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView("list")}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
                </Button>
                <div className="bg-card border rounded-xl p-6">
                  <h2 className="font-display font-semibold text-lg mb-4">
                    {view === "edit" ? "Edit Product" : "Add New Product"}
                  </h2>
                  <ProductForm
                    categories={categories}
                    editingProduct={editingProduct}
                    onSaved={() => { setView("list"); fetchAll(); }}
                    onCancel={() => setView("list")}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="font-display font-semibold mb-4">Manage Orders</h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No orders yet</div>
              ) : orders.map((order) => (
                <div key={order.id} className="bg-card border rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.shipping_address} • {order.phone}</p>
                    </div>
                    <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 text-sm">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>Rs. {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

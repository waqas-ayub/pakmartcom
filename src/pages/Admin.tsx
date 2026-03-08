import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, Package, ShoppingBag, ArrowLeft, Users, BarChart3, DollarSign, TrendingUp } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

interface Product { id: string; name: string; description: string; price: number; sale_price: number | null; image_url: string; stock: number; featured: boolean; category_id: string | null; }
interface Category { id: string; name: string; }
interface Order { id: string; total_amount: number; status: string; shipping_address: string; phone: string; created_at: string; order_items: { id: string; product_name: string; quantity: number; price: number }[]; }
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin, authLoading]);

  async function fetchAll() {
    const [prodRes, catRes, orderRes, profileRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts((prodRes.data as Product[]) || []);
    setCategories((catRes.data as Category[]) || []);
    setOrders((orderRes.data as any) || []);
    setProfiles(profileRes.data || []);
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

  if (authLoading || (user && isAdmin && loading)) return <Layout><div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!user) return <Layout><div className="text-center py-32 text-muted-foreground">Please sign in to access admin dashboard.</div></Layout>;
  if (!isAdmin) return <Layout><div className="text-center py-32 text-muted-foreground">You don't have admin access.</div></Layout>;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-pakmart-success" },
            { label: "Total Orders", value: orders.length, icon: Package, color: "text-pakmart-info" },
            { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, color: "text-pakmart-warning" },
            { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="font-display text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><ShoppingBag className="h-4 w-4 mr-1" /> Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" /> Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users ({profiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {view === "list" ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-semibold">Your Products</h2>
                  <Button onClick={() => { setEditingProduct(null); setView("add"); }}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No products yet</p>
                    <Button className="mt-4" onClick={() => { setEditingProduct(null); setView("add"); }}><Plus className="h-4 w-4 mr-1" /> Add Your First Product</Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/40"><ShoppingBag className="h-5 w-5" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Rs. {p.price.toLocaleString()}</span>
                            {p.sale_price && <span className="text-destructive">→ Rs. {p.sale_price.toLocaleString()}</span>}
                            <span>•</span><span>{p.stock} stock</span>
                            {p.featured && <span>• ⭐</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProduct(p); setView("edit"); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView("list")}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <div className="bg-card border rounded-xl p-6">
                  <h2 className="font-display font-semibold text-lg mb-4">{view === "edit" ? "Edit Product" : "Add New Product"}</h2>
                  <ProductForm categories={categories} editingProduct={editingProduct} onSaved={() => { setView("list"); fetchAll(); }} onCancel={() => setView("list")} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <h2 className="font-display font-semibold mb-4">Manage Orders</h2>
            {orders.length === 0 ? <div className="text-center py-16 text-muted-foreground">No orders yet</div> : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{order.shipping_address} • {order.phone}</p>
                      </div>
                      <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 text-xs">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between"><span>{item.product_name} × {item.quantity}</span><span>Rs. {(item.price * item.quantity).toLocaleString()}</span></div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold text-sm"><span>Total</span><span>Rs. {Number(order.total_amount).toLocaleString()}</span></div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <h2 className="font-display font-semibold mb-4">Registered Users</h2>
            {profiles.length === 0 ? <div className="text-center py-16 text-muted-foreground">No users yet</div> : (
              <div className="bg-card border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Phone</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Joined</th></tr></thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-t"><td className="p-3 text-xs">{p.full_name || "—"}</td><td className="p-3 text-xs">{p.email}</td><td className="p-3 text-xs hidden md:table-cell">{p.phone || "—"}</td><td className="p-3 text-xs hidden md:table-cell">{new Date(p.created_at).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

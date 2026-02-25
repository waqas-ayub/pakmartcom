import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Package, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  profiles?: { full_name: string; email: string } | null;
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
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form
  const [form, setForm] = useState({
    name: "", description: "", price: "", sale_price: "", image_url: "", stock: "", featured: false, category_id: "",
  });

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

  function openAddProduct() {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", sale_price: "", image_url: "", stock: "", featured: false, category_id: "" });
    setProductDialogOpen(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : "",
      image_url: p.image_url || "",
      stock: String(p.stock),
      featured: p.featured,
      category_id: p.category_id || "",
    });
    setProductDialogOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      image_url: form.image_url,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      category_id: form.category_id || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return; }
      toast({ title: "Product updated!" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); return; }
      toast({ title: "Product added!" });
    }
    setProductDialogOpen(false);
    fetchAll();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchAll();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast({ title: "Order updated" });
    fetchAll();
  }

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><ShoppingBag className="h-4 w-4 mr-1" /> Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" /> Orders ({orders.length})</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-semibold">Manage Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddProduct}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price (Rs.)</Label>
                        <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Sale Price (Rs.)</Label>
                        <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                      <Label>Featured Product</Label>
                    </div>
                    <Button type="submit" className="w-full">{editingProduct ? "Update Product" : "Add Product"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Stock</th>
                      <th className="text-left p-3">Featured</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                              {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-medium line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          Rs. {p.price.toLocaleString()}
                          {p.sale_price && <span className="text-destructive text-xs ml-1">→ {p.sale_price.toLocaleString()}</span>}
                        </td>
                        <td className="p-3">{p.stock}</td>
                        <td className="p-3">{p.featured ? "⭐" : "—"}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditProduct(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet. Add your first product!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

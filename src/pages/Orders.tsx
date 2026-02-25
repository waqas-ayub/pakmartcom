import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; price: number }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-pakmart-warning/20 text-pakmart-warning border-pakmart-warning/30",
  confirmed: "bg-pakmart-info/20 text-pakmart-info border-pakmart-info/30",
  shipped: "bg-primary/20 text-primary border-primary/30",
  delivered: "bg-pakmart-success/20 text-pakmart-success border-pakmart-success/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Orders() {
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) fetchOrders();
  }, [user, authLoading]);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setOrders((data as any) || []);
    setLoading(false);
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-muted-foreground text-sm">Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[order.status] || ""}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-display font-bold">
                  <span>Total</span>
                  <span>Rs. {Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

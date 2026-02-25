import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalPrice,
        shipping_address: address,
        phone,
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      toast({ variant: "destructive", title: "Error", description: "Failed to place order." });
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.sale_price ?? item.price,
      product_name: item.name,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add order items." });
    } else {
      clearCart();
      setOrderPlaced(true);
      toast({ title: "Order placed! 🎉", description: "Your order has been placed successfully." });
    }
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container max-w-md py-20 text-center">
          <CheckCircle className="h-16 w-16 text-pakmart-success mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-6">Thank you for shopping with PakMart. We'll notify you when your order ships.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/orders")}>View Orders</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid md:grid-cols-5 gap-8">
          <form onSubmit={handlePlaceOrder} className="md:col-span-3 space-y-4">
            <h2 className="font-display font-semibold text-lg">Shipping Details</h2>
            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Full address including city and postal code" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+92 3XX XXXXXXX" />
            </div>
            <div>
              <Label htmlFor="notes">Order Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions" />
            </div>
            <Button type="submit" className="w-full font-display font-bold" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Place Order — Rs. {totalPrice.toLocaleString()}
            </Button>
          </form>

          <div className="md:col-span-2">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-display font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span>Rs. {((item.sale_price ?? item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-display font-bold">
                <span>Total</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

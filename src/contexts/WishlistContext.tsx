import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlistIds(new Set());
  }, [user]);

  async function fetchWishlist() {
    const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user!.id);
    setWishlistIds(new Set((data || []).map((w: any) => w.product_id)));
  }

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    if (wishlistIds.has(productId)) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlistIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      setWishlistIds((prev) => new Set(prev).add(productId));
    }
  }, [user, wishlistIds]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, count: wishlistIds.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

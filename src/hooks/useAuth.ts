import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkAdmin(session.user.id), 0);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
      subscription = res.data.subscription;
    } catch (e) {
      console.error("[PakMart] Auth listener failed to start:", e);
      setLoading(false);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) checkAdmin(session.user.id);
      })
      .catch((e) => console.error("[PakMart] Could not load session:", e))
      .finally(() => setLoading(false));

    // Never stay stuck loading if the network hangs
    const timeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  async function checkAdmin(userId: string) {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    } catch (e) {
      console.warn("[PakMart] Admin check failed:", e);
      setIsAdmin(false);
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[PakMart] Sign out failed:", e);
    }
    setIsAdmin(false);
  };

  return { user, session, loading, isAdmin, signUp, signIn, signOut };
}

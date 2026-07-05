import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthError(error: AuthError | Error | null) {
  const message = (error?.message ?? "").toLowerCase();

  if (message.includes("invalid login credentials")) return "Fel e-post eller lösenord.";
  if (message.includes("email not confirmed")) {
    return "Du måste bekräfta din e-postadress innan du kan logga in.";
  }
  if (message.includes("invalid email")) return "Ange en giltig e-postadress.";
  if (message.includes("password should be at least")) return "Lösenordet är för kort.";
  if (message.includes("too many requests") || message.includes("rate limit")) {
    return "För många försök. Vänta en stund och försök igen.";
  }

  return "Något gick fel. Försök igen.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const configured = isSupabaseConfigured;
  const appBaseUrl = import.meta.env.VITE_APP_BASE_URL ?? import.meta.env.VITE_APP_URL ?? window.location.origin;

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      user,
      session,
      loading,
      login: async (email: string, password: string) => {
        if (!configured || !supabase) throw new Error("Supabase är inte konfigurerat i miljövariabler.");

        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(mapAuthError(error));
      },
      signUp: async (email: string, password: string) => {
        if (!configured || !supabase) throw new Error("Supabase är inte konfigurerat i miljövariabler.");

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${appBaseUrl}/login`,
          },
        });

        if (error) throw new Error(mapAuthError(error));
      },
      logout: async () => {
        if (!configured || !supabase) return;

        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(mapAuthError(error));
      },
      resetPassword: async (email: string) => {
        if (!configured || !supabase) throw new Error("Supabase är inte konfigurerat i miljövariabler.");

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${appBaseUrl}/reset-password`,
        });

        if (error) throw new Error(mapAuthError(error));
      },
      updatePassword: async (password: string) => {
        if (!configured || !supabase) throw new Error("Supabase är inte konfigurerat i miljövariabler.");

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(mapAuthError(error));
      },
    }),
    [loading, session, user, configured, appBaseUrl]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

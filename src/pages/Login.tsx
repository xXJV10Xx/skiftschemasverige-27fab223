import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const { configured, user, login, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inloggningen misslyckades.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signUp(email, password);
      setMessage("Kontot är skapat. Bekräfta din e-post innan du loggar in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa konto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-10">
      <Card className="w-full border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Logga in</CardTitle>
          <CardDescription>Logga in med e-post och lösenord.</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              Supabase är inte konfigurerat. Kontrollera VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY.
            </div>
          ) : null}

          <form className="mt-2 space-y-3" onSubmit={onLogin}>
            <Input
              type="email"
              placeholder="E-post"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Lösenord"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error ? <div className="text-sm text-red-300">{error}</div> : null}
            {message ? <div className="text-sm text-emerald-300">{message}</div> : null}

            <Button type="submit" className="w-full" disabled={loading || !configured}>
              {loading ? "Loggar in..." : "Logga in"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading || !configured || !email || !password}
              onClick={() => void onSignUp()}
            >
              Skapa konto
            </Button>
          </form>

          <div className="mt-4 text-sm">
            <Link to="/forgot-password" className="text-emerald-300 hover:underline">
              Glömt lösenord?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

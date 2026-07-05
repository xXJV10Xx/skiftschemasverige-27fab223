import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

export default function ResetPassword() {
  const { configured, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setMessage("Lösenordet är uppdaterat. Du kan nu logga in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera lösenordet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-10">
      <Card className="w-full border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Nytt lösenord</CardTitle>
          <CardDescription>Välj ett nytt lösenord för ditt konto.</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              Supabase är inte konfigurerat. Kontrollera VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY.
            </div>
          ) : null}

          <form className="mt-2 space-y-3" onSubmit={onSubmit}>
            <Input
              type="password"
              placeholder="Nytt lösenord"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Bekräfta nytt lösenord"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error ? <div className="text-sm text-red-300">{error}</div> : null}
            {message ? <div className="text-sm text-emerald-300">{message}</div> : null}

            <Button type="submit" className="w-full" disabled={loading || !configured}>
              {loading ? "Uppdaterar..." : "Uppdatera lösenord"}
            </Button>
          </form>

          <div className="mt-4 text-sm">
            <Link to="/login" className="text-emerald-300 hover:underline">
              Tillbaka till inloggning
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

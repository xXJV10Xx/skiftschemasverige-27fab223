import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MonthCalendar } from "../components/MonthCalendar";
import { useAuth } from "../components/AuthProvider";
import { fetchFavoritesForMonth, toggleFavorite } from "@/lib/favorites";
import { PricingLauncher } from "../components/PricingLauncher";

function clampLag(n: number): 1 | 2 | 3 | 4 | 5 {
  const v = Math.min(5, Math.max(1, Math.round(n)));
  return v as 1 | 2 | 3 | 4 | 5;
}

export default function Index() {
  const now = new Date();
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth() + 1);
  const [lagNum, setLagNum] = useState<1 | 2 | 3 | 4 | 5>(1);

  const { configured, user, logout, loading } = useAuth();

  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = 2026; y <= 2029; y++) list.push(y);
    if (!list.includes(year)) list.unshift(year);
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }, [year]);

  useEffect(() => {
    let cancelled = false;

    if (!configured || !user) {
      setFavorites(new Set());
      return;
    }

    setFavoritesLoading(true);
    fetchFavoritesForMonth({ year, month, lag: lagNum })
      .then((rows) => {
        if (cancelled) return;
        setFavorites(new Set(rows.map((r) => r.date_str)));
      })
      .catch(() => {
        if (cancelled) return;
        setFavorites(new Set());
      })
      .finally(() => {
        if (cancelled) return;
        setFavoritesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configured, user, year, month, lagNum]);

  async function onToggleFavorite(dateStr: string, lag: 1 | 2 | 3 | 4 | 5) {
    setNotice(null);

    if (!configured) {
      setNotice("Backend är inte konfigurerat ännu.");
      return;
    }

    if (!user) {
      setNotice("Logga in för att spara favoritdagar.");
      return;
    }

    const prev = new Set(favorites);
    const wasFavorite = prev.has(dateStr);
    const optimistic = new Set(favorites);
    if (wasFavorite) optimistic.delete(dateStr);
    else optimistic.add(dateStr);
    setFavorites(optimistic);

    try {
      await toggleFavorite({ userId: user.id, dateStr, lag });
    } catch {
      setFavorites(prev);
      setNotice("Kunde inte spara favorit just nu. Försök igen.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-medium text-slate-400">År</div>
              <select
                className="h-10 rounded-xl border border-slate-800 bg-slate-950/50 px-3 text-sm text-slate-100"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-medium text-slate-400">Månad</div>
              <select
                className="h-10 rounded-xl border border-slate-800 bg-slate-950/50 px-3 text-sm text-slate-100"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-medium text-slate-400">Lag</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-100 hover:bg-slate-900/60"
                  onClick={() => setLagNum((v) => clampLag(v - 1))}
                >
                  −
                </button>
                <select
                  className="h-10 rounded-xl border border-slate-800 bg-slate-950/50 px-3 text-sm text-slate-100"
                  value={lagNum}
                  onChange={(e) => setLagNum(clampLag(Number(e.target.value)))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>Lag {n}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-100 hover:bg-slate-900/60"
                  onClick={() => setLagNum((v) => clampLag(v + 1))}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <div className="text-xs text-slate-400">
              {!configured ? "Backend ej konfigurerat" : user ? "Inloggad" : "Inte inloggad"}
              {favoritesLoading ? " · laddar favoriter…" : ""}
            </div>
            {user ? (
              <button
                type="button"
                className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-900"
                onClick={() => void logout()}
                disabled={loading}
              >
                Logga ut
              </button>
            ) : (
              <Link className="text-sm text-emerald-300 hover:underline" to="/login">
                Gå till inloggning
              </Link>
            )}
          </div>
        </div>

        {notice ? (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-200">
            {notice}
          </div>
        ) : null}

        <div className="mt-3 text-xs text-slate-400">
          Tips: På mobil kan du scrolla i sidled för att se hela veckoraden.
        </div>
      </div>

      <MonthCalendar year={year} month={month} lagNum={lagNum} favorites={favorites} onToggleFavorite={onToggleFavorite} />

      <PricingLauncher />
    </div>
  );
}

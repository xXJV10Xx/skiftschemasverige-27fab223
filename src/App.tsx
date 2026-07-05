import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const location = useLocation();
  const isAuthPage = ["/login", "/forgot-password", "/reset-password"].includes(location.pathname);

  return (
    <>
      <ServiceWorkerRegister />
      <div className="flex min-h-screen flex-col">
        {!isAuthPage ? (
          <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500" />
                <div>
                  <div className="text-sm font-semibold tracking-wide text-emerald-300">
                    Skiftschemasverige
                  </div>
                  <div className="text-xs text-slate-400">SSAB Oxelösund 3-skift</div>
                </div>
              </div>
              <nav className="flex items-center gap-4 text-xs">
                <Link
                  to="/"
                  className={`hover:text-emerald-300 ${location.pathname === "/" ? "text-emerald-300" : "text-slate-300"}`}
                >
                  Kalender
                </Link>
                <Link
                  to="/favorites"
                  className={`hover:text-emerald-300 ${location.pathname === "/favorites" ? "text-emerald-300" : "text-slate-300"}`}
                >
                  Favoriter
                </Link>
              </nav>
            </div>
          </header>
        ) : null}

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 pb-20 pt-4">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>

        {!isAuthPage ? (
          <footer className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around px-6 py-2 text-xs">
              <Link
                to="/"
                className={`flex flex-col items-center ${location.pathname === "/" ? "text-emerald-300" : "text-slate-300"}`}
              >
                <span>Kalender</span>
              </Link>
              <Link
                to="/favorites"
                className={`flex flex-col items-center ${location.pathname === "/favorites" ? "text-emerald-300" : "text-slate-300"}`}
              >
                <span>Favoriter</span>
              </Link>
            </div>
          </footer>
        ) : null}
      </div>
    </>
  );
}

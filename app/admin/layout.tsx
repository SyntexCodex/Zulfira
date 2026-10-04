"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchJson, ApiError } from "./_components/api";
import type { Session } from "./_components/types";
import { AuthCtx } from "./_components/auth";
import { AdminNote } from "./_components/ui";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/investors", label: "Investors" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(path: string, href: string): boolean {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(href + "/");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (onLoginPage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchJson<Session>("/api/auth/me")
      .then((s) => {
        if (!cancelled) {
          setSession(s);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/admin/login");
        } else {
          setError(e instanceof ApiError ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [onLoginPage, router]);

  async function logout() {
    try {
      await fetchJson("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }

  if (onLoginPage) {
    return (
      <div className="min-h-screen bg-slate-100 font-[family-name:var(--font-body)]">
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          Checking session…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md">
          <AdminNote tone="error">{error}</AdminNote>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <AuthCtx.Provider value={{ session, logout }}>
      <div className="min-h-screen bg-slate-100 font-[family-name:var(--font-body)]">
        {/* sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-slate-950 text-slate-200 md:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="text-lg font-bold tracking-tight text-white">ZULFIRA</div>
            <div className="text-xs text-slate-400">Admin Console</div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
            {session.email}
          </div>
        </aside>

        {/* mobile nav */}
        <nav className="sticky top-0 z-40 flex gap-1 overflow-x-auto bg-slate-950 px-3 py-2 md:hidden">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                  active ? "bg-white/15 text-white" : "text-slate-400"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="md:pl-60">
          {/* topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <div className="text-sm font-semibold text-slate-800 md:hidden">ZULFIRA Admin</div>
            <div className="hidden text-sm text-slate-500 md:block">
              {pathname === "/admin" ? "Dashboard" : NAV.find((n) => n.href !== "/admin" && pathname.startsWith(n.href))?.label ?? ""}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                {session.name || session.email}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  session.role === "OWNER"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {session.role}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AuthCtx.Provider>
  );
}

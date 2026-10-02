"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, LayoutDashboard, Users, ShoppingBag, Ruler, FileText, Settings, Plus, LogOut, ChevronDown, Scissors } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/measurements", label: "Measurements", icon: Ruler },
  { href: "/admin/designs", label: "Designs", icon: Scissors },
  { href: "/admin/inquiries", label: "Inquiries", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/walk-in", label: "New Walk-in", icon: Plus },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <aside className="w-[280px] bg-white flex flex-col shrink-0 z-20 border-r border-slate-200/80 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] transition-all">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            P
          </div>
          <div>
            <p className="font-bold text-[16px] text-slate-800 leading-tight tracking-tight">Prince Tailor</p>
            <p className="text-[12px] text-indigo-600 font-semibold tracking-wide uppercase mt-0.5">Studio</p>
          </div>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5">
          {links.map((l) => {
            const active = ready && pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  active 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100/50" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-[18px] h-[18px]" /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col relative">
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <form 
              className="relative hidden md:block group" 
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q");
                if (q) router.push(`/admin/search?q=${encodeURIComponent(q as string)}`);
              }}
            >
              <input name="q" type="text" placeholder="Search orders, customers..." className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-80 transition-all placeholder:text-slate-400 shadow-sm" />
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </form>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200">
              <div className="h-9 w-9 bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-indigo-700 transition-colors">Admin User</p>
                <p className="text-[11px] text-slate-500 font-medium">Workspace Owner</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 ml-1 group-hover:text-slate-600" />
            </div>
          </div>
        </header>
        <main className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}

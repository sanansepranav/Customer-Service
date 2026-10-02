"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { GARMENTS, inr } from "@/lib/utils";
import { Search, Plus, SlidersHorizontal, ChevronDown, ArrowRight } from "lucide-react";

type Design = { id: string; name: string; category: string; description: string; priceFrom: number };

export default function DesignsPage() {
  const [rows, setRows] = useState<Design[]>([]);
  const [form, setForm] = useState({ name: "", category: "Shirt", description: "", priceFrom: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  async function load() {
    setRows(await api<Design[]>("/api/designs"));
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/designs", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", category: "Shirt", description: "", priceFrom: "" });
    setShowAdd(false);
    await load();
  }

  const filteredRows = rows.filter((d) => {
    if (filterCategory !== "All" && d.category !== filterCategory) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Design Catalog</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Browse and manage your bespoke garment style library.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Design
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="mb-8 bg-white border border-slate-200 rounded-[16px] p-6 shadow-sm transition-all">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 font-sans">Add New Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
            <div className="lg:col-span-1">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Design Name (e.g. Classic Tuxedo)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="lg:col-span-1 relative">
              <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {GARMENTS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="lg:col-span-1">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Starting Price (₹)" type="number" value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.value })} required />
            </div>
            <div className="lg:col-span-2">
               <div className="flex gap-4">
                  <input className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Features (e.g. Notch lapel, single-breasted)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap">Save Style</button>
               </div>
            </div>
          </div>
        </form>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-2 rounded-[16px] border border-slate-200 shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-[10px] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white font-sans transition-all"
              placeholder="Search catalog styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-1.5 overflow-x-auto px-2 md:px-0 scrollbar-hide">
            {["All", ...GARMENTS].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterCategory === cat ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}
              >
                {cat}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all whitespace-nowrap">
              <SlidersHorizontal className="w-4 h-4" /> Price Range
            </button>
         </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRows.map((d) => (
          <article key={d.id} className="bg-white rounded-[16px] border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300 group flex flex-col h-full">
             <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 group-hover:bg-indigo-100 transition-transform duration-700 ease-out"></div>
                
                <div className="flex items-start justify-between relative z-10">
                   <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 shadow-sm">
                      {d.category}
                   </span>
                </div>
                
                <div className="relative z-10">
                   <h2 className="font-serif text-2xl text-slate-900 leading-tight">{d.name}</h2>
                </div>
             </div>
             <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-slate-500 font-sans leading-relaxed line-clamp-2 flex-1 mb-5">{d.description || "Classic styling with premium bespoke tailoring."}</p>
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                   <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Starting At</p>
                      <p className="text-lg font-bold text-slate-900 font-sans">{inr(d.priceFrom)}</p>
                   </div>
                   <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </article>
        ))}
      </div>
      
      {filteredRows.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-serif text-slate-900 mb-2">No styles found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">We couldn&apos;t find any designs matching your filters. Try adjusting your search or category.</p>
        </div>
      )}
    </AdminShell>
  );
}

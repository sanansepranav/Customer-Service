"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { inr } from "@/lib/utils";
import { Plus, Search, AlertCircle, CheckCircle, PackageX, Trash2, Box, ChevronDown } from "lucide-react";

type Fabric = { id: string; name: string; type: string; color: string; meters: number; costPerM: number };

export default function FabricsPage() {
  const [rows, setRows] = useState<Fabric[]>([]);
  const [form, setForm] = useState({ name: "", type: "Cotton", color: "", meters: "", costPerM: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setRows(await api<Fabric[]>("/api/fabrics"));
  }
  
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/fabrics", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", type: "Cotton", color: "", meters: "", costPerM: "" });
    setShowAdd(false);
    await load();
  }

  async function remove(id: string) {
    if(!confirm("Delete this fabric from inventory?")) return;
    await api(`/api/fabrics/${id}`, { method: "DELETE" });
    await load();
  }

  // Helper to map generic color names to a hex for the swatch
  function getColorHex(colorName: string) {
    const map: Record<string, string> = {
      black: "#000000", white: "#ffffff", navy: "#0f172a", blue: "#3b82f6",
      red: "#ef4444", green: "#22c55e", yellow: "#eab308", gray: "#64748b",
      grey: "#64748b", beige: "#f5f5dc", brown: "#8b4513", maroon: "#800000",
      pink: "#ec4899", purple: "#a855f7", cream: "#fffdd0", charcoal: "#333333",
      olive: "#3f6212"
    };
    const c = colorName.toLowerCase().trim();
    return map[c] || "#e2e8f0";
  }

  const filteredRows = rows.filter((f) => 
    !search || 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.type.toLowerCase().includes(search.toLowerCase()) || 
    f.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fabric Stock & Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage textile rolls, material types, and calculate raw stock value.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Fabric
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="mb-8 bg-white border border-slate-200 rounded-[16px] p-6 shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-4">
             <Box className="w-4 h-4 text-indigo-600" />
             <h3 className="text-sm font-semibold text-slate-900">Quick Action: Add Fabric Stock</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Fabric Name (e.g. Premium Wool)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="lg:col-span-1 relative">
              <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Cotton", "Linen", "Silk", "Wool", "Blend", "Velvet"].map(t => (
                   <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="lg:col-span-1">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required />
            </div>
            <div className="lg:col-span-1">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Meters Available" type="number" step="0.1" value={form.meters} onChange={(e) => setForm({ ...form, meters: e.target.value })} required />
            </div>
            <div className="lg:col-span-1">
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Cost / Meter (₹)" type="number" value={form.costPerM} onChange={(e) => setForm({ ...form, costPerM: e.target.value })} required />
            </div>
            <div className="lg:col-span-6 flex justify-end mt-2">
               <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors whitespace-nowrap">Save into Inventory</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                placeholder="Search inventory by name, type or color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Low stock alert at &lt; 15m
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Fabric Name</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Material Type</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Color Swatch</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Meters in Stock</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Cost per Meter</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Total Stock Value</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((f) => {
                const totalValue = f.meters * f.costPerM;
                const isLowStock = f.meters > 0 && f.meters < 15;
                const isOutOfStock = f.meters <= 0;
                const swatchColor = getColorHex(f.color);
                
                return (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                    <td className="px-6 py-4 font-bold text-slate-900">{f.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {f.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 capitalize font-medium">
                        <span 
                          className="w-5 h-5 rounded-full border border-slate-300 shadow-sm"
                          style={{ backgroundColor: swatchColor }}
                        ></span>
                        {f.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        {f.meters}m
                        {isLowStock && <span className="flex items-center justify-center w-4 h-4 bg-red-100 rounded-full" title="Low Stock"><AlertCircle className="w-3 h-3 text-red-600" /></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{inr(f.costPerM)}/m</td>
                    <td className="px-6 py-4 font-bold text-indigo-700 bg-indigo-50/30">{inr(totalValue)}</td>
                    <td className="px-6 py-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <PackageX className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => remove(f.id)} 
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100" 
                        title="Delete Fabric"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 mb-3">
                      <Box className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-900 mb-1">No fabrics found</p>
                    <p className="text-sm">Try adjusting your search or add new fabric stock.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

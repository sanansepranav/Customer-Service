"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { inr } from "@/lib/utils";
import { Eye, Ruler, ShoppingBag, Plus, Search, Filter, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cloth: string;
  skinOrders: number;
  pastOrders: number;
  totalBill: number;
};

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", cloth: "" });

  async function load(search = q) {
    const data = await api<Customer[]>(`/api/customers?q=${encodeURIComponent(search)}`);
    setRows(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/customers", { method: "POST", body: JSON.stringify(form) });
      const phoneClean = form.phone.replace(/\D/g, "");
      const msg = encodeURIComponent(`Hello ${form.name},\nWelcome to our Tailor Studio! Your profile has been successfully registered.`);
      window.open(`https://wa.me/${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}?text=${msg}`, "_blank");
      
      setForm({ name: "", phone: "", email: "", address: "", cloth: "" });
      setShowAdd(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer and related records?")) return;
    await api(`/api/customers/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Records</h1>
          <p className="text-sm text-slate-500 mt-1">Manage client profiles, measurements, and order history.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Customer
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="mb-8 bg-white border border-slate-200 rounded-[16px] p-6 shadow-sm transition-all">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Add New Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input className="border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input className="border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="Preferred Fabric/Cloth" value={form.cloth} onChange={(e) => setForm({ ...form, cloth: e.target.value })} />
            <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">Save Record</button>
          </div>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
              placeholder="Search by name, phone, email, or fabric..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
            />
          </div>
          <button className="text-sm font-medium text-slate-600 flex items-center gap-2 hover:text-slate-900 border border-slate-200 bg-white px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium">Active Orders</th>
                <th className="px-6 py-4 font-medium">Past Orders</th>
                <th className="px-6 py-4 font-medium">Preferred Fabric</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs uppercase">{c.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-700">{c.phone}</td>
                  <td className="px-6 py-4">
                    {c.skinOrders > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {c.skinOrders} Active
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{c.pastOrders}</td>
                  <td className="px-6 py-4 text-slate-700">{c.cloth || "—"}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{inr(c.totalBill)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/customers/${c.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/measurements?customerId=${c.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="New Measurement">
                        <Ruler className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/orders?customerId=${c.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Create Order">
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                      <button onClick={() => remove(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2" title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No customers found. Try adjusting your search or add a new customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{rows.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-slate-200 text-slate-400 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-slate-200 text-slate-400 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { GARMENTS, ORDER_STATUSES, formatDate, inr } from "@/lib/utils";
import { AlertCircle, Clock, ChevronDown, CheckCircle, Scissors, Package, PenSquare, MessageCircle } from "lucide-react";

type Customer = { id: string; name: string; phone?: string };
type Fabric = { id: string; name: string };
type Order = {
  id: string;
  orderNumber: string;
  garmentType: string;
  status: string;
  quantity: number;
  amount: number;
  dueDate: string | null;
  customer: { id: string; name: string };
  fabric: { id: string; name: string } | null;
};

const RATE_CARD: Record<string, number> = {
  Shirt: 400,
  Pants: 450,
  Dress: 850,
  "Jodh Puri": 2500,
  Koti: 1200,
  Kurta: 600,
  Pajama: 400,
  Suit: 4500,
};

function OrdersPage() {
  const searchParams = useSearchParams();
  const queryCustomer = searchParams.get("customerId") || "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  
  const [form, setForm] = useState({
    customerId: "",
    garmentType: "Shirt",
    fabricId: "",
    quantity: "1",
    amount: "400",
    dueDate: "",
  });

  async function load() {
    const [o, c, f] = await Promise.all([
      api<Order[]>("/api/orders"),
      api<Customer[]>("/api/customers"),
      api<Fabric[]>("/api/fabrics"),
    ]);
    setOrders(o);
    setCustomers(c);
    setFabrics(f);
    if (!form.customerId && c[0]) {
      const pick = queryCustomer && c.some((row) => row.id === queryCustomer) ? queryCustomer : c[0].id;
      setForm((p) => ({ ...p, customerId: pick, fabricId: f[0]?.id || "" }));
    }
  }

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-calculate amount when garment or quantity changes
  useEffect(() => {
    if (editingId) return; // Don't auto-calc if editing
    const base = RATE_CARD[form.garmentType] || 400;
    const qty = parseInt(form.quantity) || 1;
    setForm(prev => ({ ...prev, amount: String(base * qty) }));
  }, [form.garmentType, form.quantity, editingId]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await api(`/api/orders/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      setEditingId(null);
    } else {
      await api("/api/orders", { method: "POST", body: JSON.stringify(form) });
    }
    const base = RATE_CARD["Shirt"];
    setForm((p) => ({ ...p, garmentType: "Shirt", amount: String(base), quantity: "1", dueDate: "" }));
    await load();
  }

  function startEdit(o: Order) {
    setEditingId(o.id);
    setForm({
      customerId: o.customer.id,
      garmentType: o.garmentType,
      fabricId: o.fabric?.id || "",
      quantity: String(o.quantity),
      amount: String(o.amount),
      dueDate: o.dueDate ? new Date(o.dueDate).toISOString().split('T')[0] : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      customerId: customers[0]?.id || "",
      garmentType: "Shirt",
      fabricId: "",
      quantity: "1",
      amount: "400",
      dueDate: "",
    });
  }

  async function setStatus(id: string, status: string) {
    await api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    await load();
  }

  function sendDeliveryWhatsApp(o: Order) {
    const c = customers.find(x => x.id === o.customer.id);
    if (!c || !c.phone) {
      alert("No phone number found for this customer.");
      return;
    }
    const phoneClean = c.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi ${o.customer.name},\nGreat news! Your order for ${o.garmentType} is ready for pickup/delivery.\nTotal Amount: ${inr(o.amount)}.\n\nThank you,\nPrince Tailor Studio`);
    window.open(`https://wa.me/${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}?text=${msg}`, "_blank");
  }

  function getStatusStyle(status: string) {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'ready':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'delivered':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cutting':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'stitching':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  }

  function isOverdue(dateStr: string | null) {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }
  
  function isUpcoming(dateStr: string | null) {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000; // <= 3 days
  }

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Order Entry & Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the garment stitching pipeline from cutting to delivery.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm mb-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit Existing Order" : "Add New Order"}
          </h2>
          {editingId && (
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md">
              Editing Mode
            </span>
          )}
        </div>
        <form onSubmit={submitForm} className="p-6">
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Customer Name</label>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 bg-white" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Garment Type</label>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 bg-white" value={form.garmentType} onChange={(e) => setForm({ ...form, garmentType: e.target.value })}>
                  {GARMENTS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Fabric Selection</label>
              <div className="relative">
                <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 bg-white" value={form.fabricId} onChange={(e) => setForm({ ...form, fabricId: e.target.value })}>
                  <option value="">Customer Provided / None</option>
                  {fabrics.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Due Date</label>
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Quantity</label>
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900" type="number" min="1" placeholder="Enter Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Total Amount (₹)</label>
              <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 bg-slate-50 font-medium" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors shadow-sm">
                Cancel Edit
              </button>
            )}
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-2.5 text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2">
              {editingId ? <PenSquare className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
              {editingId ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-900">Order Pipeline</h2>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-rose-600"><AlertCircle className="w-3.5 h-3.5" /> Overdue</span>
            <span className="flex items-center gap-1.5 text-amber-600"><Clock className="w-3.5 h-3.5" /> Upcoming (3 days)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Garment</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Fabric Used</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Current Stage</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const overdue = o.status !== 'completed' && o.status !== 'delivered' && isOverdue(o.dueDate);
                const upcoming = !overdue && o.status !== 'completed' && o.status !== 'delivered' && isUpcoming(o.dueDate);
                
                return (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900 uppercase">
                      {o.orderNumber.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{o.customer.name}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="font-medium">{o.garmentType}</span> <span className="text-slate-400 mx-1">×</span> {o.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {o.fabric ? <span className="inline-flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-slate-400" /> {o.fabric.name}</span> : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block w-36">
                        <select 
                          className={`w-full appearance-none border rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide outline-none cursor-pointer shadow-sm transition-colors ${getStatusStyle(o.status)}`} 
                          value={o.status} 
                          onChange={(e) => setStatus(o.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="text-slate-900 bg-white">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1.5 h-3.5 w-3.5 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {o.dueDate ? (
                        <div className={`flex items-center gap-2 font-medium ${overdue ? 'text-rose-600' : upcoming ? 'text-amber-600' : 'text-slate-600'}`}>
                          {overdue && <AlertCircle className="w-4 h-4" />}
                          {upcoming && <Clock className="w-4 h-4" />}
                          {!overdue && !upcoming && o.status === 'delivered' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {formatDate(o.dueDate)}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(o.status === 'ready' || o.status === 'delivered') && (
                           <button onClick={() => sendDeliveryWhatsApp(o)} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Send Delivery Update via WhatsApp">
                             <MessageCircle className="w-4 h-4" />
                           </button>
                        )}
                        <button onClick={() => startEdit(o)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No orders found. Add a new order to get started.
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

export default function OrdersPageWrapper() {
  return (
    <Suspense fallback={<AdminShell><p className="p-6 text-slate-500">Loading orders…</p></AdminShell>}>
      <OrdersPage />
    </Suspense>
  );
}

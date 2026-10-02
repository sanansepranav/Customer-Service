"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";

type Step = 1 | 2 | 3;

export default function WalkInWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Customer State
  const [customerId, setCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", email: "", address: "" });

  // Measurement State
  const [garmentType, setGarmentType] = useState("Dress");
  const [measurementFields, setMeasurementFields] = useState("");

  // Order State
  const [orderForm, setOrderForm] = useState({ quantity: 1, amount: 0, dueDate: "", notes: "" });

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // First, see if we can find them by phone (not strictly required but good for demo)
      // We'll just create a new customer for simplicity in this wizard
      const res = await api<{ id: string }>("/api/customers", {
        method: "POST",
        body: JSON.stringify(customerForm),
      });
      setCustomerId(res.id);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleMeasurementSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let fields: Record<string, unknown> = {};
      try {
        fields = measurementFields ? JSON.parse(measurementFields) : {};
      } catch {
        fields = { raw: measurementFields };
      }

      await api("/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          garmentType,
          fields,
        }),
      });
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          garmentType,
          ...orderForm,
        }),
      });
      router.push("/admin/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display text-navy mb-2">New Walk-in Customer</h1>
        <div className="flex gap-2 mb-8 text-sm">
          <span className={`px-3 py-1 rounded-full ${step >= 1 ? "bg-gold text-navy font-semibold" : "bg-slate-200 text-slate-500"}`}>1. Customer</span>
          <span className={`px-3 py-1 rounded-full ${step >= 2 ? "bg-gold text-navy font-semibold" : "bg-slate-200 text-slate-500"}`}>2. Measurements</span>
          <span className={`px-3 py-1 rounded-full ${step >= 3 ? "bg-gold text-navy font-semibold" : "bg-slate-200 text-slate-500"}`}>3. Order</span>
        </div>

        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleCustomerSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input required value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
            </div>
            <button disabled={loading} type="submit" className="mt-4 bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Next: Measurements</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleMeasurementSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Take Measurements</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Garment Type</label>
              <select value={garmentType} onChange={(e) => setGarmentType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold">
                <option>Dress</option>
                <option>Shirt + Pant</option>
                <option>Shirt</option>
                <option>Pants</option>
                <option>Suit</option>
                <option>Jodhpuri</option>
                <option>Kurta</option>
                <option>Safari</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Measurements</label>
              <textarea placeholder='e.g. {"chest": "40"} or 28*40/33*33/33*18' value={measurementFields} onChange={(e) => setMeasurementFields(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold h-32" />
              <p className="text-xs text-slate-500 mt-1">Enter measurements in JSON format or as raw text.</p>
            </div>
            <button disabled={loading} type="submit" className="mt-4 bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Next: Order Details</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleOrderSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Create Order ({garmentType})</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input type="number" min="1" required value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input type="number" required value={orderForm.amount} onChange={(e) => setOrderForm({ ...orderForm, amount: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={orderForm.dueDate} onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Instructions</label>
                <textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold h-20" />
              </div>
            </div>
            <button disabled={loading} type="submit" className="mt-4 bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Finish & Create Order</button>
          </form>
        )}
      </div>
    </AdminShell>
  );
}

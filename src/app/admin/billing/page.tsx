"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { formatDate, inr } from "@/lib/utils";

type Customer = { id: string; name: string; phone: string };
type Line = { clothName: string; quantity: string; unitPrice: string };
type Invoice = {
  id: string;
  billNumber: string;
  date: string;
  total: number;
  paid: number;
  status: string;
  customer: { name: string };
  items: { clothName: string; quantity: number; unitPrice: number; total: number }[];
};

function BillingPage() {
  const searchParams = useSearchParams();
  const queryCustomer = searchParams.get("customerId") || "";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [line, setLine] = useState<Line>({ clothName: "Cotton Saree", quantity: "1", unitPrice: "" });
  const [items, setItems] = useState<Line[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const [c, inv] = await Promise.all([api<Customer[]>("/api/customers"), api<Invoice[]>("/api/invoices")]);
    setCustomers(c);
    setInvoices(inv);
    if (!customerId) {
      const pick = queryCustomer && c.some((row) => row.id === queryCustomer) ? queryCustomer : c[0]?.id;
      if (pick) setCustomerId(pick);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewTotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0),
    [items],
  );

  function addLine() {
    if (!line.clothName || !line.quantity || !line.unitPrice) return;
    setItems([...items, line]);
    setLine({ clothName: "", quantity: "1", unitPrice: "" });
  }

  async function saveBill() {
    setError("");
    // #region agent log
    fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'post-fix',hypothesisId:'B',location:'src/app/admin/billing/page.tsx:saveBill',message:'save bill click',data:{customerId,itemCount:items.length,previewTotal},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      await api("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          date,
          paid: previewTotal,
          items: items.map((i) => ({
            clothName: i.clothName,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
          })),
        }),
      });
      setItems([]);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function printBill() {
    window.print();
  }

  const customer = customers.find((c) => c.id === customerId);

  return (
    <AdminShell>
      <div className="no-print">
        <h1 className="text-2xl font-display text-navy">Billing</h1>
        <p className="text-sm text-slate-500 mb-4">Create a bill, store it in SQL, then print.</p>
      </div>
      <div className="print-bill bg-white border rounded-xl p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-navy text-gold grid place-items-center font-display text-2xl mx-auto">P</div>
          <h2 className="font-display text-xl text-navy mt-2">prince tailor and designer studio</h2>
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm no-print">
          <select className="border rounded px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
            ))}
          </select>
          <input type="date" className="border rounded px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <p className="text-sm mt-3 hidden print:block">Customer: {customer?.name} · {customer?.phone} · {date}</p>
        <div className="mt-4 no-print grid md:grid-cols-4 gap-2">
          <input className="border rounded px-3 py-2" placeholder="Cloth name" value={line.clothName} onChange={(e) => setLine({ ...line, clothName: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Qty" type="number" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Price per unit" type="number" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: e.target.value })} />
          <button type="button" onClick={addLine} className="bg-green-600 text-white rounded">Add to bill</button>
        </div>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="bg-violet-100">
              <th className="p-2 text-left">Cloth name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Price</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{i.clothName}</td>
                <td className="p-2 text-center">{i.quantity}</td>
                <td className="p-2 text-center">{i.unitPrice}</td>
                <td className="p-2 text-center">{Number(i.quantity) * Number(i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-right font-semibold mt-3">Total: {inr(previewTotal)}</p>
        <div className="no-print mt-4 grid grid-cols-2 gap-2">
          <button onClick={printBill} className="bg-blue-600 text-white py-2 rounded">Print bill</button>
          <button onClick={() => setItems([])} className="bg-red-500 text-white py-2 rounded">Reset bill</button>
        </div>
        <button onClick={saveBill} disabled={!items.length} className="no-print mt-3 w-full bg-navy text-white py-2 rounded disabled:opacity-50">
          Save bill to database
        </button>
        {error ? <p className="no-print text-red-600 text-sm mt-2">{error}</p> : null}
      </div>
      <div className="no-print mt-8 bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-medium">Saved bills</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2">Bill</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="px-4 py-2">{inv.billNumber}</td>
                <td className="px-4 py-2">{inv.customer.name}</td>
                <td className="px-4 py-2">{formatDate(inv.date)}</td>
                <td className="px-4 py-2">{inr(inv.total)}</td>
                <td className="px-4 py-2 capitalize">{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={<AdminShell><p>Loading billing…</p></AdminShell>}>
      <BillingPage />
    </Suspense>
  );
}

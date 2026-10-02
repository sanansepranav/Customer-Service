"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { inr } from "@/lib/utils";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: string;
  garmentType: string;
  status: string;
  amount: number;
  dueDate: string | null;
  customer: { name: string; phone?: string };
};

function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      setLoading(true);
      try {
        const o = await api<Order[]>("/api/orders");
        const lowerQ = q.toLowerCase();
        const filtered = o.filter(
          (ord) =>
            ord.orderNumber.toLowerCase().includes(lowerQ) ||
            ord.customer.name.toLowerCase().includes(lowerQ) ||
            ord.garmentType.toLowerCase().includes(lowerQ)
        );
        setResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (q) search();
    else {
      setResults([]);
      setLoading(false);
    }
  }, [q]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing results for <span className="font-medium text-slate-900">&quot;{q}&quot;</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Searching...</div>
        ) : results.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No results found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">We couldn&apos;t find anything matching your search. Try checking for typos or using different keywords.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Order Number</th>
                <th className="px-6 py-3 font-medium">Customer Name</th>
                <th className="px-6 py-3 font-medium">Garment Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-900">{o.orderNumber}</td>
                  <td className="px-6 py-4 text-slate-700">{o.customer.name}</td>
                  <td className="px-6 py-4 text-slate-700">{o.garmentType}</td>
                  <td className="px-6 py-4 capitalize text-slate-700">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      o.status === 'completed' || o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      o.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{inr(o.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">Go to Orders</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<AdminShell><p>Loading...</p></AdminShell>}>
      <SearchPage />
    </Suspense>
  );
}

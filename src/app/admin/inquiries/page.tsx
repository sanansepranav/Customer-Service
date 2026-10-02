"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { formatDate } from "@/lib/utils";

type Inquiry = { id: string; name: string; phone: string; email: string; message: string; status: string; createdAt: string };

export default function InquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  useEffect(() => {
    api<Inquiry[]>("/api/inquiries").then(setRows);
  }, []);
  return (
    <AdminShell>
      <h1 className="text-2xl font-display text-navy">Website inquiries</h1>
      <p className="text-sm text-slate-500 mb-4">Messages from the public contact form.</p>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-2">{r.name}<div className="text-xs text-slate-400">{r.email}</div></td>
                <td className="px-4 py-2">{r.phone}</td>
                <td className="px-4 py-2">{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

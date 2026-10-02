"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/client";
import { inr } from "@/lib/utils";
import { ShoppingBag, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

type Dash = {
  totalCustomers: number;
  totalOrders: number;
  skinOrders: number;
  totalCloth: number;
  totalBill: number;
  recent: { id: string; orderNumber: string; garmentType: string; status: string; amount: number; createdAt: string; customer: { name: string } }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Dash>("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
      <p className="text-slate-500 text-[15px] mt-2 mb-10 font-medium">Live studio metrics and recent activity.</p>
      {error ? <p className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/orders"><StatCard label="Total Orders" value={String(data?.totalOrders ?? "—")} colorClass="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 ring-1 ring-indigo-200/50" hint="+12.5% from last month" icon={<ShoppingBag className="w-5 h-5" />} /></Link>
        <Link href="/admin/workers"><StatCard label="Active Workers" value="14" colorClass="bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 ring-1 ring-cyan-200/50" hint="Currently employed" icon={<Users className="w-5 h-5" />} /></Link>
        <Link href="/admin/orders"><StatCard label="Ready Orders" value={String(data?.skinOrders ?? "—")} colorClass="bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-200/50" hint="Ready for pickup" icon={<CheckCircle className="w-5 h-5" />} /></Link>
      </div>
      <Card className="mt-10 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-5 px-8">
          <CardTitle>Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Garment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.recent.length ? data.recent.map((o) => {
              const statusVariant = o.status === 'completed' || o.status === 'delivered' ? 'success' :
                                    o.status === 'pending' ? 'warning' : 'info';
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-semibold text-slate-700">{o.orderNumber}</TableCell>
                  <TableCell>
                    <Link className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors" href={`/admin/customers/${o.customer.name}`}>
                      {o.customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">{o.garmentType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-800 font-bold tracking-tight text-right">
                    {inr(o.amount)}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 font-medium py-10">
                  No recent orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AdminShell>
  );
}

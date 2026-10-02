import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [orders, invoices, fabrics] = await Promise.all([
    prisma.order.findMany(),
    prisma.invoice.findMany(),
    prisma.fabric.findMany(),
  ]);
  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  return NextResponse.json({
    orders: orders.length,
    revenue: invoices.reduce((s, i) => s + i.paid, 0),
    billed: invoices.reduce((s, i) => s + i.total, 0),
    outstanding: invoices.reduce((s, i) => s + (i.total - i.paid), 0),
    fabricMeters: fabrics.reduce((s, f) => s + f.meters, 0),
    byStatus,
  });
}

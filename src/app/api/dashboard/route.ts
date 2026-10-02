import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [customers, orders, invoices, fabrics] = await Promise.all([
    prisma.customer.count(),
    prisma.order.findMany(),
    prisma.invoice.findMany(),
    prisma.fabric.findMany(),
  ]);
  const totalOrders = orders.length;
  const skinOrders = orders.filter((o) => o.status !== "delivered").length;
  const totalCloth = fabrics.reduce((s, f) => s + f.meters, 0);
  const totalBill = invoices.reduce((s, i) => s + i.total, 0);
  const recent = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });
  return NextResponse.json({
    totalCustomers: customers,
    totalOrders,
    skinOrders,
    totalCustomersWithOrders: customers,
    totalCloth,
    totalBill,
    recent,
  });
}

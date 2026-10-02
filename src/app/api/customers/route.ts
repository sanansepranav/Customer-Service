import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { cloth: { contains: q } },
          ],
        }
      : undefined,
    include: { orders: true, invoices: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    customers.map((c) => ({
      ...c,
      skinOrders: c.orders.filter((o) => o.status !== "delivered").length,
      pastOrders: c.orders.filter((o) => o.status === "delivered").length,
      totalBill: c.invoices.reduce((s, i) => s + i.total, 0),
    })),
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.phone) {
    return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
  }
  let customer = await prisma.customer.findUnique({
    where: { phone: String(body.phone) },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: String(body.phone),
        email: body.email || "",
        address: body.address || "",
        cloth: body.cloth || "",
        notes: body.notes || "",
      },
    });
  }
  return NextResponse.json(customer, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    include: { customer: true, fabric: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.customerId || !body.garmentType) {
    return NextResponse.json({ error: "Customer and garment required" }, { status: 400 });
  }
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
  });
  let nextNum = 1001;
  if (lastOrder && lastOrder.orderNumber.startsWith("ORD-")) {
    const numStr = lastOrder.orderNumber.replace("ORD-", "");
    const parsed = parseInt(numStr, 10);
    if (!isNaN(parsed)) nextNum = parsed + 1;
  } else if (lastOrder) {
    const count = await prisma.order.count();
    nextNum = 1001 + count;
  }
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${nextNum}`,
      customerId: body.customerId,
      garmentType: body.garmentType,
      fabricId: body.fabricId || null,
      status: body.status || "pending",
      quantity: Number(body.quantity || 1),
      amount: Number(body.amount || 0),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes || "",
    },
    include: { customer: true, fabric: true },
  });
  return NextResponse.json(order, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const order = await prisma.order.update({
    where: { id },
    data: {
      customerId: body.customerId,
      garmentType: body.garmentType,
      fabricId: body.fabricId || null,
      status: body.status,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      notes: body.notes,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
    include: { customer: true, fabric: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

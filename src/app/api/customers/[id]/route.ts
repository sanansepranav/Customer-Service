import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: true, measurements: true, invoices: { include: { items: true } } },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email ?? "",
      address: body.address ?? "",
      cloth: body.cloth ?? "",
      notes: body.notes ?? "",
    },
  });
  return NextResponse.json(customer);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

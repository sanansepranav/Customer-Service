import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const fabric = await prisma.fabric.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      color: body.color,
      meters: body.meters !== undefined ? Number(body.meters) : undefined,
      costPerM: body.costPerM !== undefined ? Number(body.costPerM) : undefined,
    },
  });
  return NextResponse.json(fabric);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.fabric.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

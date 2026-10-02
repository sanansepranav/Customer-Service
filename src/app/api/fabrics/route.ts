import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.fabric.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const fabric = await prisma.fabric.create({
    data: {
      name: body.name,
      type: body.type || "",
      color: body.color || "",
      meters: Number(body.meters || 0),
      costPerM: Number(body.costPerM || 0),
    },
  });
  return NextResponse.json(fabric, { status: 201 });
}

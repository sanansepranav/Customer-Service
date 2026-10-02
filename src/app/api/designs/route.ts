import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.design.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const design = await prisma.design.create({
    data: {
      name: body.name,
      category: body.category || "Shirt",
      description: body.description || "",
      priceFrom: Number(body.priceFrom || 0),
    },
  });
  return NextResponse.json(design, { status: 201 });
}

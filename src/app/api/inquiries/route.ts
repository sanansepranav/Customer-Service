import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.phone || !body.message) {
    return NextResponse.json({ error: "Name, phone and message required" }, { status: 400 });
  }
  const inquiry = await prisma.inquiry.create({
    data: {
      name: body.name,
      phone: String(body.phone),
      email: body.email || "",
      message: body.message,
    },
  });
  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}

export async function GET() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

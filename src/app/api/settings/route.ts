import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  return NextResponse.json(setting);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const setting = await prisma.setting.upsert({
    where: { id: 1 },
    create: {
      shopName: body.shopName,
      tagline: body.tagline || "",
      phone: body.phone || "",
      email: body.email || "",
      address: body.address || "",
      gstin: body.gstin || "",
      openingHours: body.openingHours || "",
    },
    update: {
      shopName: body.shopName,
      tagline: body.tagline,
      phone: body.phone,
      email: body.email,
      address: body.address,
      gstin: body.gstin,
      openingHours: body.openingHours,
    },
  });
  return NextResponse.json(setting);
}

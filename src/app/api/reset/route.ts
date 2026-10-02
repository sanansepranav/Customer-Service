import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete in reverse order of dependencies to avoid foreign key constraints
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.measurement.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.fabric.deleteMany();
    await prisma.design.deleteMany();
    await prisma.inquiry.deleteMany();
    
    return NextResponse.json({ message: "All data successfully erased." });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await prisma.invoice.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error:  "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.customerId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Customer and line items required" }, { status: 400 });
  }
  const items = body.items.map((item: { clothName: string; quantity: number; unitPrice: number; orderId?: string }) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    return {
      clothName: item.clothName,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      orderId: item.orderId || null,
    };
  });
  const subtotal = items.reduce((s: number, i: { total: number }) => s + i.total, 0);
  const tax = Number(body.tax || 0);
  const total = subtotal + tax;
  const paid = Number(body.paid || 0);
  const existing = await prisma.invoice.findMany({ select: { billNumber: true } });
  let max = 2026000;
  for (const inv of existing) {
    const n = Number(String(inv.billNumber).replace(/[^\d]/g, ""));
    if (Number.isFinite(n) && n > max) max = n;
  }
  const billNumber = `BILL-${max + 1}`;
  // #region agent log
  fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'post-fix',hypothesisId:'B',location:'src/app/api/invoices/route.ts:POST',message:'invoice create attempt',data:{existingCount:existing.length,max,billNumber,itemCount:items.length,customerId:body.customerId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    const invoice = await prisma.invoice.create({
      data: {
        billNumber,
        customerId: body.customerId,
        date: body.date ? new Date(body.date) : new Date(),
        subtotal,
        tax,
        total,
        paid,
        status: paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid",
        notes: body.notes || "",
        items: { create: items },
      },
      include: { customer: true, items: true },
    });
    // #region agent log
    fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'post-fix',hypothesisId:'B',location:'src/app/api/invoices/route.ts:POST:success',message:'invoice created',data:{billNumber:invoice.billNumber,id:invoice.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save bill";
    return NextResponse.json({ error: message.includes("Unique") ? "Bill number already exists" : "Could not save bill" }, { status: 500 });
  }
}

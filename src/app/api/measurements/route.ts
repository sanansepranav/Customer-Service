import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || undefined;
  const garmentType = searchParams.get("garmentType") || undefined;
  const rows = await prisma.measurement.findMany({
    where: { customerId, garmentType },
    include: { customer: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    rows.map((r) => ({ ...r, fields: JSON.parse(r.fields || "{}") })),
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  // #region agent log
  fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'pre-fix',hypothesisId:'A',location:'src/app/api/measurements/route.ts:POST',message:'measurement POST session',data:{hasSession:Boolean(session)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.customerId || !body.garmentType) {
    return NextResponse.json({ error: "Customer and garment required" }, { status: 400 });
  }
  const row = await prisma.measurement.upsert({
    where: {
      customerId_garmentType: {
        customerId: body.customerId,
        garmentType: body.garmentType,
      },
    },
    create: {
      customerId: body.customerId,
      garmentType: body.garmentType,
      unit: body.unit || "cm",
      fields: JSON.stringify(body.fields || {}),
    },
    update: {
      unit: body.unit || "cm",
      fields: JSON.stringify(body.fields || {}),
    },
    include: { customer: true },
  });
  return NextResponse.json({ ...row, fields: JSON.parse(row.fields || "{}") });
}

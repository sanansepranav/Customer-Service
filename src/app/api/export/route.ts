import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const customers = await prisma.customer.findMany();
    const orders = await prisma.order.findMany({ include: { customer: true } });
    
    // Create a CSV structure for Customers
    let csv = "--- CUSTOMERS ---\n";
    csv += "ID,Name,Phone,Email,Address\n";
    customers.forEach(c => {
      csv += `"${c.id}","${c.name}","${c.phone}","${c.email}","${c.address}"\n`;
    });

    // Create a CSV structure for Orders
    csv += "\n--- ORDERS ---\n";
    csv += "Order Number,Customer Name,Garment Type,Quantity,Amount,Status,Due Date\n";
    orders.forEach(o => {
      csv += `"${o.orderNumber}","${o.customer.name}","${o.garmentType}","${o.quantity}","${o.amount}","${o.status}","${o.dueDate || ''}"\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=Prince_Tailor_Studio_Backup.csv"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

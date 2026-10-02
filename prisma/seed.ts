import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const pantsFields = {
  waist: "86",
  hip: "102",
  thigh: "62",
  knee: "42",
  bottom: "21",
  frontRise: "28",
  backRise: "38",
  inseam: "80",
  outseam: "102",
  crotch: "32",
  seatHeight: "8",
};

const shirtFields = {
  chest: "108",
  shoulder: "46",
  sleeve: "64",
  neck: "40",
  length: "76",
  waist: "98",
  cuff: "24",
};

async function main() {
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.fabric.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.design.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  await prisma.user.create({
    data: {
      name: "Prince Tailor",
      email: "admin@princetailor.local",
      passwordHash: await bcrypt.hash("prince123", 10),
      role: "admin",
    },
  });

  await prisma.setting.create({
    data: {
      shopName: "Prince Tailor and Designer Studio",
      tagline: "Bespoke stitching, measurements, and billing for your shop",
      phone: "+91 98765 43210",
      email: "hello@princetailor.local",
      address: "Shop 12, Market Road, Pune, Maharashtra 411001",
      gstin: "27AABCP1234F1Z5",
      currency: "INR",
      openingHours: "Mon–Sat 10:00–20:00",
    },
  });

  const fabrics = await Promise.all(
    [
      { name: "Cotton Saree", type: "Cotton", color: "Ivory", meters: 48, costPerM: 220 },
      { name: "Suiting", type: "Wool blend", color: "Navy", meters: 32, costPerM: 890 },
      { name: "Linen", type: "Linen", color: "Beige", meters: 24, costPerM: 540 },
      { name: "Silk", type: "Silk", color: "Maroon", meters: 18, costPerM: 1450 },
      { name: "Cotton", type: "Cotton", color: "White", meters: 60, costPerM: 180 },
    ].map((f) => prisma.fabric.create({ data: f })),
  );

  const customersData = [
    { name: "Rahul Sharma", phone: "9876543210", cloth: "Suiting", email: "rahul@example.com", address: "Kothrud, Pune" },
    { name: "Amit Patel", phone: "9876543211", cloth: "Cotton", email: "amit@example.com", address: "Viman Nagar" },
    { name: "Vikram Singh", phone: "9876543212", cloth: "Linen", email: "vikram@example.com", address: "Baner" },
    { name: "Suresh Kumar", phone: "9876543213", cloth: "Denim", email: "suresh@example.com", address: "Hadapsar" },
    { name: "Manish Joshi", phone: "9876543214", cloth: "Silk", email: "manish@example.com", address: "Deccan" },
    { name: "Deepak Mehta", phone: "9876543215", cloth: "Cotton", email: "deepak@example.com", address: "Wakad" },
    { name: "Rohit Verma", phone: "9876543216", cloth: "Suiting", email: "rohit@example.com", address: "Aundh" },
    { name: "Vijay Pandey", phone: "9876543217", cloth: "Linen", email: "vijay@example.com", address: "Kharadi" },
    { name: "Anjali Nair", phone: "9876543218", cloth: "Cotton", email: "anjali@example.com", address: "Camp" },
    { name: "Meera Gupta", phone: "9876543219", cloth: "Silk", email: "meera@example.com", address: "Shivaji Nagar" },
  ];

  const customers = [];
  for (const c of customersData) {
    customers.push(await prisma.customer.create({ data: c }));
  }

  const garments = ["Pants", "Shirt", "Jacket", "Koti", "Jodhpuri"];
  const statuses = ["pending", "cutting", "stitching", "trial", "ready", "delivered"];

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    await prisma.measurement.create({
      data: {
        customerId: customer.id,
        garmentType: "Pants",
        fields: JSON.stringify(pantsFields),
      },
    });
    await prisma.measurement.create({
      data: {
        customerId: customer.id,
        garmentType: "Shirt",
        fields: JSON.stringify(shirtFields),
      },
    });

    const qty = (i % 4) + 1;
    const fabric = fabrics[i % fabrics.length];
    const amount = 2500 + i * 850;
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${1001 + i}`,
        customerId: customer.id,
        garmentType: garments[i % garments.length],
        fabricId: fabric.id,
        status: statuses[i % statuses.length],
        quantity: qty,
        amount,
        dueDate: new Date(Date.now() + (i + 2) * 86400000),
        notes: "Standard fitting, extra 2cm ease.",
      },
    });

    if (i % 2 === 0) {
      const paid = i % 4 === 0 ? amount : amount / 2;
      await prisma.invoice.create({
        data: {
          billNumber: `BILL-${2026001 + i}`,
          customerId: customer.id,
          subtotal: amount,
          tax: 0,
          total: amount,
          paid,
          status: paid >= amount ? "paid" : "partial",
          items: {
            create: {
              orderId: order.id,
              clothName: `${order.garmentType} — ${fabric.name}`,
              quantity: qty,
              unitPrice: amount / qty,
              total: amount,
            },
          },
        },
      });
    }
  }

  await prisma.design.createMany({
    data: [
      { name: "Classic two-piece suit", category: "Jacket", description: "Notch lapel, single breasted, tapered trousers.", priceFrom: 12500 },
      { name: "Jodhpuri bandhgala", category: "Jodhpuri", description: "Closed collar ceremonial jacket with contrast piping.", priceFrom: 9800 },
      { name: "Linen summer shirt", category: "Shirt", description: "Breathable linen, mother-of-pearl buttons.", priceFrom: 2200 },
      { name: "Nehru koti", category: "Koti", description: "Waistcoat over kurta, five-button front.", priceFrom: 3500 },
      { name: "Formal trousers", category: "Pants", description: "Flat front, belt loops, pressed crease.", priceFrom: 2800 },
    ],
  });

  await prisma.inquiry.createMany({
    data: [
      { name: "Sanjay Kulkarni", phone: "9988776655", email: "sanjay@example.com", message: "Need wedding sherwani stitching in 3 weeks." },
      { name: "Priya Deshmukh", phone: "9123456780", message: "Alteration for two silk saree blouses." },
    ],
  });

  console.log("Seeded Prince Tailor Studio. Login: admin@princetailor.local / prince123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

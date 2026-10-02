# Prince Tailor and Designer Studio

Full-stack tailor shop website: public marketing site plus a staff dashboard for customers, measurements, orders, fabric, billing, and reports. Data lives in a **SQLite** SQL database via Prisma.

Inspired by TailorSoft-style shop software and your Tailor Master / billing screens — not a pixel-perfect clone.

## Run locally

```bash
cd prince-tailor-studio
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open:

- Public site: [http://localhost:3000](http://localhost:3000)
- Staff login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Login:** `admin@princetailor.local` / `prince123`

## What is included

| Area | What it does |
| --- | --- |
| Website | Shop landing page, designs from the database, enquiry form |
| Customers | Search, add, delete, order counts, billed totals |
| Orders | Create jobs, update status (pending → delivered) |
| Measurements | Pants / shirt / jacket / koti / jodhpuri fields saved per customer |
| Fabric | Stock in meters and cost |
| Billing | Line items, save bill, print |
| Reports | Revenue, outstanding, status counts |
| Settings | Shop name, phone, GSTIN used on the public site |

## Database

SQLite file: `prisma/dev.db` (created by migrate). Schema: `prisma/schema.prisma`.

To use PostgreSQL or MySQL later, change `provider` and `DATABASE_URL` in Prisma and run migrate again.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ContactForm";
import { inr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [setting, designs] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.design.findMany({ take: 5, orderBy: { priceFrom: "desc" } }),
  ]);

  const shop = setting?.shopName || "Prince Tailor and Designer Studio";

  return (
    <div className="bg-[#f7f4ee] text-ink">
      <header className="sticky top-0 z-20 bg-[#0d1b36]/95 text-white backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-gold text-navy grid place-items-center font-display">P</span>
            <span className="font-display text-lg leading-tight">Prince Tailor</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-white/80">
            <a href="#services">Services</a>
            <a href="#designs">Designs</a>
            <a href="#visit">Visit</a>
            <a href="#enquire">Enquire</a>
          </nav>
          <Link href="/admin/login" className="text-xs md:text-sm border border-gold text-gold px-3 py-1.5 rounded-full">
            Staff login
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm tracking-[0.25em] uppercase">Est. bespoke studio</p>
            <h1 className="font-display text-4xl md:text-6xl mt-3 leading-tight">{shop}</h1>
            <p className="mt-5 text-white/75 max-w-md">
              {setting?.tagline ||
                "Made-to-measure shirts, suits, jodhpuri, and festive wear. Measurements, orders, and bills kept in one shop system."}
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#enquire" className="bg-gold text-navy px-5 py-2.5 rounded-full font-semibold">
                Book a fitting
              </a>
              <a href="#services" className="border border-white/30 px-5 py-2.5 rounded-full">
                Our work
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Suits from ₹12,500", "Same-week alterations", "Saved measurements", "Printed GST bills"].map((t) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5 min-h-[120px] flex items-end">
                <p className="font-display text-lg">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl text-navy">What the studio makes</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {[
            { t: "Bespoke suits", d: "Two-piece and three-piece, trial fitting, hand-finished trousers." },
            { t: "Shirts & linens", d: "Office and summer shirts cut from your saved measurements." },
            { t: "Jodhpuri & koti", d: "Ceremonial closed-collar jackets and waistcoats." },
            { t: "Ladies stitching", d: "Blouses, saree falls, and festive outfits with careful fitting." },
            { t: "Alterations", d: "Waist, hem, and restyle work with a due-date on every ticket." },
            { t: "Uniforms", d: "Small-batch uniforms for offices and hotels." },
          ].map((s) => (
            <article key={s.t} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
              <h3 className="font-display text-xl text-navy">{s.t}</h3>
              <p className="text-sm text-slate-600 mt-2">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="designs" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl text-navy">Featured designs</h2>
          <p className="text-slate-500 mt-2 text-sm">Live catalogue from the shop database.</p>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {designs.map((d) => (
              <article key={d.id} className="rounded-2xl border p-5">
                <p className="text-xs uppercase tracking-wide text-gold">{d.category}</p>
                <h3 className="font-display text-xl mt-1">{d.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{d.description}</p>
                <p className="mt-4 font-medium">From {inr(d.priceFrom)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl text-navy">Visit the shop</h2>
          <p className="mt-4 text-slate-600">{setting?.address}</p>
          <p className="mt-2">{setting?.phone}</p>
          <p>{setting?.email}</p>
          <p className="mt-2 text-sm text-slate-500">{setting?.openingHours}</p>
        </div>
        <div className="rounded-2xl bg-navy text-white p-8" id="enquire">
          <h2 className="font-display text-2xl">Reach us</h2>
          <p className="text-white/70 text-sm mt-1 mb-5">Your message is stored as an inquiry for the tailor.</p>
          <ContactForm />
        </div>
      </section>

      <footer className="bg-navy text-white/70 py-8 text-center text-sm">
        © {new Date().getFullYear()} {shop}. Bespoke stitching, measurements, and billing.
      </footer>
    </div>
  );
}

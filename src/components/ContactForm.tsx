"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not send");
      return;
    }
    setOk("Thank you. The studio received your request.");
    setForm({ name: "", phone: "", email: "", message: "" });
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      {ok ? <p className="text-green-700 text-sm">{ok}</p> : null}
      <input required className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <textarea required rows={4} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50" placeholder="What would you like stitched?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <button className="bg-gold text-navy font-semibold rounded-lg py-2.5">Send enquiry</button>
    </form>
  );
}

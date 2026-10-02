"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";

type Setting = {
  shopName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  openingHours: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<Setting>({
    shopName: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    openingHours: "",
  });
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api<Setting>("/api/settings").then(setForm);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/settings", { method: "PUT", body: JSON.stringify(form) });
    setSaved("Settings saved");
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-display text-navy">Settings</h1>
      <form onSubmit={save} className="mt-4 bg-white border rounded-xl p-5 max-w-2xl grid gap-3">
        {(
          [
            ["shopName", "Shop name"],
            ["tagline", "Tagline"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["address", "Address"],
            ["gstin", "GSTIN"],
            ["openingHours", "Opening hours"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <button className="bg-navy text-white rounded-lg py-2 mt-2">Save</button>
        {saved ? <p className="text-green-700 text-sm">{saved}</p> : null}
      </form>

      <div className="mt-8 bg-white border border-red-200 rounded-xl p-5 max-w-2xl shadow-sm">
        <h2 className="text-lg font-bold text-red-700 mb-2">Danger Zone & Data Management</h2>
        <p className="text-sm text-slate-500 mb-6">Backup your database to an Excel (CSV) sheet or completely erase all records.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => window.open("/api/export", "_blank")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-center"
          >
            Export All Data (Excel / CSV)
          </button>
          
          <button 
            onClick={async () => {
              if(confirm("WARNING: This will permanently delete ALL customers, orders, fabrics, and measurements from your database. Have you exported your data first? Click OK to erase everything.")){
                await fetch("/api/reset", { method: "POST" });
                alert("All data has been successfully erased. The system is now completely empty.");
                window.location.reload();
              }
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-center"
          >
            Erase All Data (Factory Reset)
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { GARMENTS, MEASUREMENT_TEMPLATES } from "@/lib/utils";
import { ChevronDown, Save, CheckCircle, Eye, Download } from "lucide-react";

type Customer = { id: string; name: string };
type Measurement = { id: string; customerId: string; garmentType: string; fields: Record<string, string> };

function MeasurementsPage() {
  const searchParams = useSearchParams();
  const queryCustomer = searchParams.get("customerId") || "";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [garment, setGarment] = useState("Pants");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");

  const template = MEASUREMENT_TEMPLATES[garment] || [];

  async function loadFor(cid: string, g: string) {
    const rows = await api<Measurement[]>(`/api/measurements?customerId=${cid}&garmentType=${g}`);
    setFields(rows[0]?.fields || {});
  }

  useEffect(() => {
    api<Customer[]>("/api/customers").then((c) => {
      setCustomers(c);
      const pick = queryCustomer && c.some((row) => row.id === queryCustomer) ? queryCustomer : c[0]?.id;
      if (pick) {
        setCustomerId(pick);
        loadFor(pick, garment);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (customerId) loadFor(customerId, garment);
  }, [customerId, garment]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    // #region agent log
    fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'pre-fix',hypothesisId:'D',location:'src/app/admin/measurements/page.tsx:save',message:'measurement save click',data:{customerId,garment,fieldCount:Object.keys(fields).length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      await api("/api/measurements", {
        method: "POST",
        body: JSON.stringify({ customerId, garmentType: garment, fields }),
      });
      setSaved("Saved to database");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      setSaved((err as Error).message);
    }
  }

  function downloadCSV() {
    const c = customers.find(x => x.id === customerId);
    if (!c) return;
    const header = ["Customer", "Garment", ...template.map(t => t.label)].join(",");
    const row = [`"${c.name}"`, garment, ...template.map(t => `"${fields[t.key] || ""}"`)].join(",");
    const csv = `${header}\n${row}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.name.replace(/\s+/g, "_")}_${garment}_Measurements.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const diagram = useMemo(() => {
    if (garment === "Pants") return <PantsDiagram fields={fields} focusedField={focusedField} />;
    return <ShirtDiagram label={garment} fields={fields} focusedField={focusedField} />;
  }, [garment, fields, focusedField]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Garment Measurements</h1>
        <p className="text-sm text-slate-500 mt-1">Select a customer and garment type to enter their tailored measurements.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {GARMENTS.map((g) => (
            <button
              key={g}
              onClick={() => setGarment(g)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${garment === g ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72 relative">
           <label className="sr-only">Select Customer</label>
           <select className="w-full appearance-none border border-slate-200 rounded-[12px] pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 bg-white shadow-sm font-medium" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
             {customers.map((c) => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        <button 
          onClick={downloadCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          title="Export to Excel (CSV)"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <form onSubmit={save} className="grid lg:grid-cols-[340px_1fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
             <h3 className="text-sm font-semibold text-slate-900">{garment} Measurements</h3>
             <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">cm</span>
          </div>
          <div className="p-2 overflow-y-auto max-h-[500px]">
            <table className="w-full text-sm">
              <tbody>
                {template.map((row, i) => (
                  <tr key={row.key} className="border-b border-slate-50 last:border-0 group transition-colors">
                    <td className="pl-4 py-3 w-8 text-indigo-400 font-mono text-xs font-medium">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-2 py-3 font-medium text-slate-700">{row.label}</td>
                    <td className="pr-4 py-3 text-right">
                      <div className="relative inline-block w-24">
                        <input
                          className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-right font-medium text-slate-900 group-hover:border-slate-300"
                          value={fields[row.key] || ""}
                          placeholder="0.0"
                          onFocus={() => setFocusedField(row.key)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFields({ ...fields, [row.key]: e.target.value })}
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">cm</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Raw / Shorthand</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white placeholder:text-slate-400 min-h-[80px]"
              value={fields.raw || ""}
              onChange={(e) => setFields({ ...fields, raw: e.target.value })}
              placeholder="e.g. 28*40/33*33/33*18"
            />
          </div>
          <div className="p-5 bg-white border-t border-slate-100">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Record
            </button>
            {saved ? <p className="text-emerald-600 text-xs font-medium mt-3 text-center flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> {saved}</p> : null}
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-[16px] overflow-hidden flex flex-col shadow-inner">
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Visual Reference Guide</h3>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"><Eye className="w-3.5 h-3.5"/> Interactive Preview</span>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center min-h-[600px]">
            {diagram}
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

function PantsDiagram({ fields, focusedField }: { fields: Record<string, string>, focusedField: string | null }) {
  const outlineColor = "#0f172a"; // Navy
  const measureColor = "#dc2626"; // Red
  const activeColor = "#ef4444"; // Brighter red
  
  const frontCx = 150;
  const backCx = 450;
  const scale = 1.35;
  const topY = 20;

  const frontPath = `
    M 60 20
    L 130 20
    C 135 40, 140 70, 140 90
    L 130 180
    L 125 280
    L 75 280
    L 70 180
    C 60 120, 40 100, 45 90
    C 55 90, 65 60, 60 20
    Z
  `;

  const backPath = `
    M 55 10
    L 135 25
    C 145 50, 150 70, 150 95
    L 135 180
    L 130 280
    L 70 280
    L 65 180
    C 50 120, 20 100, 25 90
    C 40 90, 55 50, 55 10
    Z
  `;

  const getLineProps = (key: string) => {
    const isActive = focusedField === key || (key === 'length' && focusedField === 'outseam') || (key === 'rise' && focusedField === 'crotch');
    return {
      stroke: isActive ? activeColor : measureColor,
      strokeWidth: isActive ? 2 : 1.5,
      strokeDasharray: "4 4",
      className: "transition-all duration-300",
      filter: isActive ? "drop-shadow(0px 0px 3px rgba(239,68,68,0.6))" : "none"
    };
  };

  const getTextProps = (key: string) => {
    const isActive = focusedField === key || (key === 'length' && focusedField === 'outseam') || (key === 'rise' && focusedField === 'crotch');
    return {
      fill: isActive ? activeColor : measureColor,
      className: `transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'}`,
    };
  };

  const renderLabel = (x: number, y: number, text: string, val: string | undefined, key: string, width: number) => {
    const display = val ? `${text} ${val}` : text;
    return (
      <g>
        <rect x={x - width/2} y={y - 8} width={width} height="16" fill="white" className="transition-all duration-300" />
        <text x={x} y={y + 3} fontSize="10" textAnchor="middle" {...getTextProps(key)}>{display}</text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px]">
      <svg viewBox="0 0 600 450" className="w-full max-w-3xl drop-shadow-sm bg-white">
        
        {/* === FRONT VIEW (LEFT) === */}
        <g transform={`translate(${frontCx - 100 * scale}, ${topY}) scale(${scale})`}>
          <path d={frontPath} fill="#ffffff" stroke={outlineColor} strokeWidth="1" strokeLinejoin="round" />
          
          <line x1="100" y1="20" x2="100" y2="280" stroke={outlineColor} strokeWidth="0.5" strokeDasharray="2 2" />
          
          <line x1="60" y1="20" x2="130" y2="20" {...getLineProps("waist")} />
          {renderLabel(95, 20, "Waist", fields.waist, "waist", 50)}

          <line x1="55" y1="60" x2="137" y2="60" {...getLineProps("hip")} />
          {renderLabel(95, 60, "Hip", fields.hip, "hip", 45)}

          <line x1="50" y1="90" x2="140" y2="90" {...getLineProps("thigh")} />
          {renderLabel(95, 90, "Thigh", fields.thigh, "thigh", 45)}

          <line x1="75" y1="280" x2="125" y2="280" {...getLineProps("bottom")} />
          {renderLabel(100, 280, "Bottom", fields.bottom, "bottom", 50)}

          <line x1="145" y1="20" x2="145" y2="280" {...getLineProps("length")} />
          <g transform="translate(145, 150) rotate(90)">
            {renderLabel(0, 0, "Length", fields.length || fields.outseam, "length", 60)}
          </g>

          <line x1="40" y1="90" x2="40" y2="280" {...getLineProps("inseam")} />
          <g transform="translate(40, 185) rotate(-90)">
            {renderLabel(0, 0, "Inseam", fields.inseam, "inseam", 60)}
          </g>
        </g>

        {/* === BACK VIEW (RIGHT) === */}
        <g transform={`translate(${backCx - 100 * scale}, ${topY}) scale(${scale})`}>
          <path d={backPath} fill="#ffffff" stroke={outlineColor} strokeWidth="1" strokeLinejoin="round" />
          
          <line x1="95" y1="18" x2="100" y2="280" stroke={outlineColor} strokeWidth="0.5" strokeDasharray="2 2" />
          
          <line x1="95" y1="18" x2="95" y2="90" {...getLineProps("rise")} />
          <g transform="translate(95, 50) rotate(90)">
            {renderLabel(0, 0, "Rise", fields.rise || fields.crotch, "rise", 50)}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function MeasurementsPageWrapper() {
  return (
    <Suspense fallback={<AdminShell><p>Loading measurements…</p></AdminShell>}>
      <MeasurementsPage />
    </Suspense>
  );
}

function ShirtDiagram({ fields, focusedField }: { label?: string, fields: Record<string, string>, focusedField: string | null }) {
  const outlineColor = "#0f172a"; // Navy for shirt outlines
  const measureColor = "#dc2626"; // Red for measurement lines
  const activeColor = "#ef4444"; // Brighter red for focused
  
  const frontCx = 150;
  const backCx = 450;
  const scale = 1.35;
  const topY = 20;

  // Professional dress shirt path (Base CX=100)
  const shirtPath = `
    M 85 15 
    L 50 30 
    L 20 180 
    L 40 185 
    L 60 80 
    C 60 100, 65 120, 65 150 
    L 60 240 
    Q 100 270, 140 240 
    L 135 150 
    C 135 120, 140 100, 140 80 
    L 160 185 
    L 180 180 
    L 150 30 
    L 115 15 
    Q 100 30, 85 15 
    Z
  `;

  // Helper for dynamic styling
  const getLineProps = (key: string) => {
    const isActive = focusedField === key;
    return {
      stroke: isActive ? activeColor : measureColor,
      strokeWidth: isActive ? 2 : 1.5,
      strokeDasharray: "4 4",
      className: "transition-all duration-300",
      filter: isActive ? "drop-shadow(0px 0px 3px rgba(239,68,68,0.6))" : "none"
    };
  };

  const getTextProps = (key: string) => {
    const isActive = focusedField === key;
    return {
      fill: isActive ? activeColor : measureColor,
      className: `transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'}`,
    };
  };

  const renderLabel = (x: number, y: number, text: string, val: string | undefined, key: string, width: number) => {
    const display = val ? `${text} ${val}` : text;
    return (
      <g>
        <rect x={x - width/2} y={y - 8} width={width} height="16" fill="white" className="transition-all duration-300" />
        <text x={x} y={y + 3} fontSize="10" textAnchor="middle" {...getTextProps(key)}>{display}</text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px]">
      <svg viewBox="0 0 600 450" className="w-full max-w-3xl drop-shadow-sm bg-white">
        
        {/* === FRONT VIEW (LEFT) === */}
        <g transform={`translate(${frontCx - 100 * scale}, ${topY}) scale(${scale})`}>
          <path d={shirtPath} fill="#ffffff" stroke={outlineColor} strokeWidth="1" strokeLinejoin="round" />
          
          {/* Collar & Buttons */}
          <path d="M 85 15 L 100 30 L 115 15 L 100 5 Z" fill="#ffffff" stroke={outlineColor} strokeWidth="1" strokeLinejoin="round"/>
          <line x1="100" y1="30" x2="100" y2="260" stroke={outlineColor} strokeWidth="0.8" />
          {[50, 90, 130, 170, 210, 250].map((cy) => (
            <circle key={cy} cx="100" cy={cy} r="1.2" fill={outlineColor} />
          ))}

          {/* Cuffs */}
          <path d="M 23 165 L 43 170" fill="none" stroke={outlineColor} strokeWidth="0.8" />
          <path d="M 157 170 L 177 165" fill="none" stroke={outlineColor} strokeWidth="0.8" />

          {/* Measurements */}
          
          {/* Neck */}
          <ellipse cx="100" cy="18" rx="16" ry="6" fill="none" {...getLineProps("neck")} />
          {renderLabel(100, 26, "Neck", fields.neck, "neck", 45)}

          {/* Chest */}
          <ellipse cx="100" cy="90" rx="38" ry="8" fill="none" {...getLineProps("chest")} />
          {renderLabel(100, 90, "Chest", fields.chest, "chest", 50)}

          {/* Waist */}
          <ellipse cx="100" cy="160" rx="36" ry="8" fill="none" {...getLineProps("waist")} />
          {renderLabel(100, 160, "Waist", fields.waist, "waist", 50)}

          {/* Sleeve Length */}
          <line x1="150" y1="30" x2="178" y2="178" {...getLineProps("sleeve")} />
          <g transform="translate(170, 100) rotate(79)">
            {renderLabel(0, 0, "Sleeve Length", fields.sleeve, "sleeve", 85)}
          </g>

          {/* Cuff */}
          <ellipse cx="168" cy="182" rx="10" ry="3" fill="none" transform="rotate(-10 168 182)" {...getLineProps("cuff")} />
        </g>


        {/* === BACK VIEW (RIGHT) === */}
        <g transform={`translate(${backCx - 100 * scale}, ${topY}) scale(${scale})`}>
          <path d={shirtPath} fill="#ffffff" stroke={outlineColor} strokeWidth="1" strokeLinejoin="round" />
          
          {/* Back Collar & Yoke */}
          <path d="M 85 15 Q 100 22 115 15" fill="none" stroke={outlineColor} strokeWidth="1" />
          <path d="M 55 40 Q 100 45 145 40" fill="none" stroke={outlineColor} strokeWidth="1" />
          
          {/* Cuffs */}
          <path d="M 23 165 L 43 170" fill="none" stroke={outlineColor} strokeWidth="0.8" />
          <path d="M 157 170 L 177 165" fill="none" stroke={outlineColor} strokeWidth="0.8" />

          {/* Measurements */}
          
          {/* Shoulder */}
          <line x1="50" y1="40" x2="150" y2="40" {...getLineProps("shoulder")} />
          {renderLabel(100, 40, "Shoulder", fields.shoulder, "shoulder", 65)}

          {/* Length */}
          <line x1="100" y1="20" x2="100" y2="260" {...getLineProps("length")} />
          <g transform="translate(100, 140) rotate(90)">
            {renderLabel(0, 0, "Shirt Length", fields.length, "length", 75)}
          </g>
        </g>
      </svg>
    </div>
  );
}

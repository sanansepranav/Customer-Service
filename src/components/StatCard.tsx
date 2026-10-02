export function StatCard({
  label,
  value,
  hint,
  colorClass = "text-indigo-600 bg-indigo-50",
  icon = null
}: {
  label: string;
  value: string;
  hint?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold tracking-wide text-slate-500 group-hover:text-slate-700 transition-colors">{label}</p>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
          {icon || <span className="font-bold text-lg">{value.charAt(0) || "—"}</span>}
        </div>
      </div>
      <p className="text-4xl font-bold tracking-tight text-slate-800 mt-2">{value}</p>
      {hint ? <p className="text-[13px] font-medium text-slate-400 mt-3 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>{hint}</p> : null}
    </div>
  );
}

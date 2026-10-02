"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/client";
import { inr } from "@/lib/utils";
import { LineChart, BarChart3, TrendingUp, IndianRupee, Layers, Package, ShoppingBag, Clock, Scissors, CheckCircle, Truck, Box } from "lucide-react";

type Report = {
  orders: number;
  revenue: number;
  billed: number;
  outstanding: number;
  fabricMeters: number;
  byStatus: Record<string, number>;
};

export default function ReportsPage() {
  const [data, setData] = useState<Report | null>(null);
  
  useEffect(() => {
    api<Report>("/api/reports").then(setData);
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'cutting': return <Scissors className="w-5 h-5 text-blue-500" />;
      case 'stitching':
      case 'trial': return <Layers className="w-5 h-5 text-purple-500" />;
      case 'ready': 
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'delivered': return <Truck className="w-5 h-5 text-slate-500" />;
      default: return <Package className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 border-amber-100 text-amber-900';
      case 'cutting': return 'bg-blue-50 border-blue-100 text-blue-900';
      case 'stitching':
      case 'trial': return 'bg-purple-50 border-purple-100 text-purple-900';
      case 'ready': 
      case 'completed': return 'bg-emerald-50 border-emerald-100 text-emerald-900';
      case 'delivered': return 'bg-slate-50 border-slate-200 text-slate-700';
      default: return 'bg-indigo-50 border-indigo-100 text-indigo-900';
    }
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Key metrics, financial overviews, and production pipeline status.</p>
      </div>

      {/* Summary Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[16px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-colors">
           <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                 <ShoppingBag className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                 <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
           </div>
           <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-slate-900">{data?.orders ?? "—"}</h3>
           </div>
        </div>

        <div className="bg-white rounded-[16px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
           <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                 <IndianRupee className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
           </div>
           <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Billed Amount</p>
              <h3 className="text-3xl font-bold text-slate-900">{data ? inr(data.billed) : "—"}</h3>
           </div>
        </div>

        <div className="bg-white rounded-[16px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
           <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                 <CheckCircle className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
           </div>
           <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Collected Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900">{data ? inr(data.revenue) : "—"}</h3>
           </div>
        </div>

        <div className="bg-white rounded-[16px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between group hover:border-rose-200 transition-colors">
           <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                 <Layers className="w-5 h-5 text-rose-600 group-hover:text-white transition-colors" />
              </div>
           </div>
           <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Outstanding</p>
              <h3 className="text-3xl font-bold text-slate-900">{data ? inr(data.outstanding) : "—"}</h3>
           </div>
        </div>
      </div>

      {/* Inventory Summary Banner */}
      <div className="mb-8 bg-slate-900 rounded-[16px] p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Box className="w-7 h-7 text-indigo-400" />
           </div>
           <div>
              <h3 className="text-lg font-semibold text-white">Fabric Inventory Summary</h3>
              <p className="text-sm text-slate-400">Total raw materials currently stocked across all categories.</p>
           </div>
        </div>
        <div className="relative z-10 bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 flex items-center gap-3 w-full md:w-auto">
           <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total On Hand:</span>
           <span className="text-2xl font-bold text-white">{data?.fabricMeters ?? 0} <span className="text-lg text-slate-400 font-medium">meters</span></span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Status Breakdown Section */}
         <div className="lg:col-span-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Order Status Pipeline</h3>
            <div className="bg-white border border-slate-200 rounded-[16px] shadow-sm p-4 flex-1">
               <div className="grid grid-cols-1 gap-3">
                 {Object.entries(data?.byStatus || {}).map(([k, v]) => (
                   <div key={k} className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(k)} transition-colors`}>
                     <div className="flex items-center gap-3">
                        {getStatusIcon(k)}
                        <span className="font-semibold capitalize">{k}</span>
                     </div>
                     <span className="text-lg font-bold bg-white/50 px-3 py-1 rounded-lg shadow-sm border border-black/5">{v}</span>
                   </div>
                 ))}
                 {(!data || Object.keys(data.byStatus).length === 0) && (
                   <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                     <p className="font-medium">No active orders</p>
                   </div>
                 )}
               </div>
            </div>
         </div>

         {/* Data Visualization Cards */}
         <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Analytics Overview</h3>
            <div className="grid sm:grid-cols-2 gap-6 flex-1">
               <div className="bg-white border border-slate-200 rounded-[16px] shadow-sm flex flex-col overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                     <h4 className="font-semibold text-slate-900">Monthly Revenue</h4>
                     <LineChart className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/50 min-h-[200px]">
                     {/* Placeholder for actual Chart.js / Recharts component */}
                     <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 bg-white">
                        <span className="text-sm font-medium">Chart rendering area</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white border border-slate-200 rounded-[16px] shadow-sm flex flex-col overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                     <h4 className="font-semibold text-slate-900">Popular Garments</h4>
                     <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/50 min-h-[200px]">
                     {/* Placeholder for actual Chart.js / Recharts component */}
                     <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 bg-white">
                        <span className="text-sm font-medium">Chart rendering area</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </AdminShell>
  );
}

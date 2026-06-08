"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Plus,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Globe
} from "lucide-react";
import { DashboardHeader } from "../components/DashboardHeader";
import { cn } from "../lib/utils";
import Link from "next/link";

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reportsRes, servicesRes] = await Promise.all([
          fetch("/api/monitor"),
          fetch("/api/services")
        ]);
        const reportsData = await reportsRes.json();
        const servicesData = await servicesRes.json();
        
        // Robust array validation
        setReports(Array.isArray(reportsData) ? reportsData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setReports([]);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live updates every 5s
    return () => clearInterval(interval);
  }, []);

  const totalServices = services.length;
  const breakingAlerts = reports.filter(r => r.type === "BREAKING").length;
  const healthyServices = totalServices - services.filter(s => {
      const sReports = reports.filter(r => r.endpoint === s.url);
      return sReports.some(r => r.type === "BREAKING");
  }).length;

  const stats = [
    { label: "Active Monitors", value: totalServices, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+2 new" },
    { label: "Healthy APIs", value: healthyServices, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "100% up" },
    { label: "Active Alerts", value: breakingAlerts, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", trend: "Requires action" },
    { label: "Drift Checks", value: reports.length, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10", trend: "Real-time" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <DashboardHeader title="Overview" />
      
      <main className="flex-1 p-8 space-y-10 max-w-7xl mx-auto w-full">
        {/* Animated Background Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className={cn("inline-flex p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 group-hover:text-primary transition-colors">
                  {stat.trend}
                </div>
              </div>
              
              <div className="flex flex-col mt-2">
                <span className="text-sm font-medium text-muted-foreground/80 tracking-tight">{stat.label}</span>
                <span className="text-4xl font-bold tracking-tighter mt-1">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
          {/* Services Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of all microservices</p>
              </div>
              <Link href="/services" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-105 transition-all shadow-xl shadow-primary/20 active:scale-95">
                <Plus className="w-4 h-4" />
                Add Service
              </Link>
            </div>
            
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.03] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Endpoint</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Baseline</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Reliability</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic">
                            No active monitors. Use the drift-sdk to start tracking.
                          </td>
                        </tr>
                      ) : (
                        services.map((service, i) => {
                          const hasDrift = reports.some(r => r.endpoint === service.url && r.type === "BREAKING");
                          return (
                            <motion.tr 
                              key={service.url}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                            >
                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm group-hover:text-primary transition-colors">{service.url.split('/').pop()}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono mt-1 opacity-50">{service.url}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-blue-400">Captured</span>
                              </td>
                              <td className="px-8 py-6">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  !hasDrift ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                                )}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", !hasDrift ? "bg-emerald-500" : "bg-destructive")} />
                                  {!hasDrift ? "Stable" : "Alert"}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <Link href="/drifts" className="text-muted-foreground hover:text-white transition-colors">
                                  <ArrowUpRight className="w-4 h-4 ml-auto" />
                                </Link>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Live activity
            </h2>
            <div className="p-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] h-[500px] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {reports.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-8">
                       <p className="text-sm text-muted-foreground italic">Listening for heartbeats...</p>
                    </div>
                  ) : (
                    reports.slice(0, 10).map((report, i) => (
                      <motion.div 
                        key={report.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group"
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                          report.type === "BREAKING" ? "bg-destructive/10" : "bg-primary/10"
                        )}>
                          {report.type === "BREAKING" ? (
                             <AlertCircle className="w-5 h-5 text-destructive" />
                          ) : (
                             <TrendingUp className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{report.serviceName}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{report.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-muted-foreground/30" />
                            <span className="text-[10px] text-muted-foreground/50 italic capitalize">{new Date(Number(report.timestamp)).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
              <Link href="/drifts" className="w-full py-4 text-xs font-bold uppercase tracking-widest text-center text-primary hover:bg-white/5 transition-all border-t border-white/5">
                Investigate all drifts
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

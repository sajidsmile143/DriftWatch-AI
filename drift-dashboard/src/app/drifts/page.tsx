"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "../../components/DashboardHeader";
import { 
  AlertCircle, 
  ShieldAlert, 
  BrainCircuit, 
  History, 
  ChevronRight,
  Info,
  Bug,
  LayoutTemplate
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { DriftReport } from "../../lib/store";
import { explainDriftImpact } from "../../lib/ai-explainer";

export default function DriftsPage() {
  const [reports, setReports] = useState<DriftReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, { result: string; loading: boolean }>>({});
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [monitorRes, settingsRes] = await Promise.all([
          fetch("/api/monitor"),
          fetch("/api/settings")
        ]);
        const reportsData = await monitorRes.json();
        const settingsData = await settingsRes.json();
        setReports(reportsData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Error loading drifts data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAIAnalyze = async (report: DriftReport) => {
    setAiAnalysis(prev => ({ ...prev, [report.id]: { result: "", loading: true } }));
    
    const analysis = await explainDriftImpact(
      report.serviceName, 
      report.diff, 
      settings?.geminiApiKey
    );

    setAiAnalysis(prev => ({ 
      ...prev, 
      [report.id]: { result: analysis, loading: false } 
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <DashboardHeader title="API Drifts" />
      
      <main className="p-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-primary/20 rounded-[2rem] shadow-2xl shadow-primary/20">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Active Drifts</h2>
            <p className="text-muted-foreground text-sm font-medium">Investigate schema mutations and AI-predicted impacts.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Scanning frequencies...</span>
          </div>
        ) : reports.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem] text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold">Systems Stable</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm leading-relaxed">
              DriftWatch is currently in orbit. No API schema changes detected across your microservices.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Visual Connector / Accent */}
                <div className={cn(
                  "absolute -left-4 top-0 bottom-0 w-1.5 rounded-full blur-sm",
                  report.type === "BREAKING" ? "bg-destructive/50" : "bg-orange-500/50"
                )} />

                <div className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] hover:border-white/10 transition-all duration-500 shadow-2xl">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl shrink-0 mt-1",
                        report.type === "BREAKING" ? "bg-destructive/10" : "bg-orange-500/10"
                      )}>
                        <Bug className={cn(
                          "w-6 h-6",
                          report.type === "BREAKING" ? "text-destructive" : "text-orange-500"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{report.serviceName}</h4>
                           <span className={cn(
                             "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                             report.type === "BREAKING" ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-500"
                           )}>
                             {report.type}
                           </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground mt-1 opacity-60">{report.endpoint}</p>
                        <p className="text-sm font-medium mt-4 text-white/80 leading-relaxed border-l-2 border-primary/20 pl-4">
                          {report.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{new Date(report.timestamp).toLocaleString()}</span>
                      <button 
                        onClick={() => handleAIAnalyze(report)}
                        disabled={aiAnalysis[report.id]?.loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {aiAnalysis[report.id]?.loading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <BrainCircuit className="w-4 h-4" />
                        )}
                        {aiAnalysis[report.id]?.result ? "Rerun AI Audit" : "AI Impact Audit"}
                      </button>
                    </div>
                  </div>

                  {/* AI Result Area */}
                  <AnimatePresence>
                    {aiAnalysis[report.id]?.result && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                      >
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-[1.5rem] relative overflow-hidden group/ai">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/ai:opacity-30 transition-opacity">
                            <BrainCircuit className="w-20 h-20 text-primary" />
                          </div>
                          <div className="flex items-start gap-4">
                             <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 border border-primary/30 shrink-0">
                               <Info className="w-4 h-4 text-primary" />
                             </div>
                             <div className="space-y-2">
                               <h5 className="text-xs font-bold text-primary uppercase tracking-widest">Orbital AI Insights</h5>
                               <p className="text-sm text-primary/90 leading-relaxed italic pr-12">
                                 &ldquo;{aiAnalysis[report.id].result}&rdquo;
                               </p>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Diff Visualizer - Premium Side by Side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Baseline Schema</span>
                         <LayoutTemplate className="w-4 h-4 text-muted-foreground/20" />
                      </div>
                      <div className="p-6 bg-[#0a0a0a] rounded-[2rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-3 right-3 text-[10px] text-emerald-500/50 font-bold border border-emerald-500/20 px-2 py-1 rounded">HEALTHY</div>
                        <pre className="text-xs font-mono text-emerald-400/80 overflow-x-auto whitespace-pre-wrap">
                          {Object.entries(report.diff.expected).map(([key, type]) => (
                            <div key={key} className="flex gap-2 group/line">
                               <span className="text-white/20 select-none group-hover/line:text-white/40">{">"}</span>
                               <span className="text-white/60">{key}:</span>
                               <span className="text-emerald-400 font-bold">{type}</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Actual Payload Analysis</span>
                         <Bug className="w-4 h-4 text-muted-foreground/20" />
                      </div>
                      <div className={cn(
                        "p-6 rounded-[2rem] border border-white/5 relative overflow-hidden",
                        report.type === "BREAKING" ? "bg-destructive/5" : "bg-orange-500/5"
                      )}>
                        <div className={cn(
                          "absolute top-3 right-3 text-[10px] font-bold border px-2 py-1 rounded",
                          report.type === "BREAKING" ? "text-destructive border-destructive/20" : "text-orange-500 border-orange-500/20"
                        )}>{report.type === "BREAKING" ? "CRITICAL" : "CAUTION"}</div>
                        
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {Object.entries(report.diff.actual).map(([key, type]) => {
                            const isNew = !(key in report.diff.expected);
                            const typeChanged = key in report.diff.expected && report.diff.expected[key] !== type;
                            
                            return (
                              <div key={key} className={cn(
                                "flex gap-2 group/line px-2 -mx-2 rounded transition-colors",
                                isNew ? "bg-emerald-500/10" : typeChanged ? "bg-destructive/10" : ""
                              )}>
                                 <span className="text-white/20 select-none">{typeChanged ? "!" : isNew ? "+" : ">"}</span>
                                 <span className="text-white/60">{key}:</span>
                                 <span className={cn(
                                   "font-bold",
                                   typeChanged ? "text-destructive" : isNew ? "text-emerald-400" : "text-white/40"
                                 )}>{type}</span>
                                 {typeChanged && <span className="text-[10px] text-destructive/50 italic ml-auto">expected {report.diff.expected[key]}</span>}
                                 {isNew && <span className="text-[10px] text-emerald-500/50 italic ml-auto">new field</span>}
                              </div>
                            );
                          })}
                          {/* Show missing keys */}
                          {Object.keys(report.diff.expected).filter(k => !(k in report.diff.actual)).map(key => (
                            <div key={key} className="flex gap-2 bg-destructive/20 text-destructive px-2 -mx-2 rounded border border-destructive/20 mt-1">
                               <span className="text-destructive/50 select-none">x</span>
                               <span className="font-bold opacity-50 line-through truncate">{key}</span>
                               <span className="text-[10px] font-black uppercase ml-auto">REMOVED</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

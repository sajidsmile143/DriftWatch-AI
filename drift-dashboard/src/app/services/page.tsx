"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "../../components/DashboardHeader";
import { 
  FileJson, 
  Activity, 
  Database, 
  Terminal,
  ExternalLink,
  Search,
  Copy,
  Check,
  Code2,
  Box,
  Braces
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { ApiSchema } from "../../lib/store";

export default function ServicesPage() {
  const [baselines, setBaselines] = useState<ApiSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setBaselines(data);
        setLoading(false);
      });
  }, []);

  const handleCopyType = (service: ApiSchema) => {
    const interfaceName = (service.url.split("/").pop() || "Api")
      .split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("") + "Response";
    
    const fields = Object.entries(service.schema)
      .map(([key, type]) => `  ${key}: ${type};`)
      .join("\n");
      
    const tsInterface = `export interface ${interfaceName} {\n${fields}\n}`;
    
    navigator.clipboard.writeText(tsInterface);
    setCopiedId(service.url + "-type");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMock = (service: ApiSchema) => {
    const mock = Object.keys(service.schema).reduce((acc, k) => {
      acc[k] = (service.schema[k] === "number" ? 123 : 
               service.schema[k] === "boolean" ? true : 
               service.schema[k] === "array" ? [] : "example") as any;
      return acc;
    }, {} as Record<string, unknown>);
    
    navigator.clipboard.writeText(JSON.stringify(mock, null, 2));
    setCopiedId(service.url + "-mock");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = baselines.filter(b => 
    b.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <DashboardHeader title="Live Documentation" />
      
      <main className="p-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 rounded-[2rem] shadow-2xl shadow-indigo-500/20">
              <Database className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter">API Catalog</h2>
              <p className="text-muted-foreground text-sm font-medium">Auto-generated contracts from your lived microservices.</p>
            </div>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-xl"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Mapping infrastructure...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem] text-center">
            <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-bold italic opacity-50">Catalogue Empty</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">Deploy the DriftWatch SDK to begin indexing your API contracts automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {filtered.map((service, i) => (
              <motion.div
                key={service.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="p-10 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] hover:border-white/10 transition-all duration-500 shadow-2xl overflow-hidden">
                  {/* Subtle Background Icon */}
                  <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                     <Braces className="w-64 h-64" />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/20 to-primary/20 flex items-center justify-center border border-white/5 shadow-inner">
                        <Terminal className="w-8 h-8 text-primary shadow-lg" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <h4 className="text-2xl font-bold tracking-tight">{service.url.split("/").pop() || "Service"}</h4>
                           <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white/50">
                             {service.method}
                           </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground mt-1 select-all">{service.url}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => handleCopyType(service)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                       >
                         {copiedId === service.url + "-type" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code2 className="w-3.5 h-3.5 text-primary" />}
                         {copiedId === service.url + "-type" ? "Copied" : "Copy Interface"}
                       </button>
                       <button 
                        onClick={() => handleCopyMock(service)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                       >
                         {copiedId === service.url + "-mock" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Box className="w-3.5 h-3.5 text-emerald-500" />}
                         {copiedId === service.url + "-mock" ? "Copied" : "JSON Mock"}
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* Contract Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contract definition</h5>
                      </div>
                      <div className="bg-[#080808] rounded-[2rem] p-8 border border-white/5 relative group/code shadow-inner">
                        <div className="space-y-4">
                          {Object.entries(service.schema).map(([key, type]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors rounded px-2 -mx-2">
                              <span className="text-sm font-semibold text-white/70">{key}</span>
                              <span className={cn(
                                "text-[10px] font-mono px-2 py-0.5 rounded border",
                                type === "number" ? "text-blue-400 border-blue-400/20 bg-blue-400/5" :
                                type === "boolean" ? "text-indigo-400 border-indigo-400/20 bg-indigo-400/5" :
                                type === "array" ? "text-orange-400 border-orange-400/20 bg-orange-400/5" :
                                "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                              )}>
                                {type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview / Mock Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                        <FileJson className="w-4 h-4 text-emerald-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payload Preview</h5>
                      </div>
                      <div className="bg-[#080808] rounded-[2rem] p-8 border border-white/5 shadow-inner relative h-full min-h-[250px] group/mock">
                        <div className="absolute top-4 right-6 text-[10px] font-bold text-emerald-500/30 font-mono">LIVE_SPEC.json</div>
                        <pre className="text-xs font-mono text-emerald-400/60 overflow-x-auto h-full scrollbar-hide">
                          {JSON.stringify(
                            Object.keys(service.schema).reduce((acc, k) => {
                              acc[k] = (service.schema[k] === "number" ? 124 : 
                                       service.schema[k] === "boolean" ? true : 
                                       service.schema[k] === "array" ? ["item_1", "item_2"] : "string_val") as any;
                              return acc;
                            }, {} as Record<string, unknown>), 
                          null, 2)}
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
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

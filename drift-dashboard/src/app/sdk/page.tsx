"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Code2, Copy, Check, Terminal, Key, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function SDKPage() {
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [installCopied, setInstallCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>("LOADING_KEY...");
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) setApiKey(data.apiKey);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const codeSnippet = `// 1. Initialize Driftly in your App entry point (e.g., layout.tsx)
import { initDriftly } from "driftly-sdk";

initDriftly({
  monitorUrl: "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/monitor",
  apiKey: "${apiKey}", // Your unique project identity
  serviceName: "My-Awesome-App",
  enabled: process.env.NODE_ENV !== "development" 
});`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <DashboardHeader title="SDK Integration" />
      
      <main className="p-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/20">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter text-white">Installation Guide</h2>
            <p className="text-muted-foreground text-sm font-medium">Follow these steps to connect your frontend application to Driftly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Step 1 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">1</div>
                <h3 className="text-xl font-bold">Install the package</h3>
              </div>
              <div 
                onClick={() => {
                  navigator.clipboard.writeText("npm install driftly-sdk");
                  setInstallCopied(true);
                  setTimeout(() => setInstallCopied(false), 2000);
                }}
                className="p-6 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] font-mono text-sm flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
              >
                <span className="text-white/60">
                  <span className="text-primary font-bold">npm install</span> driftly-sdk
                </span>
                <div className="p-2 bg-white/5 rounded-lg opacity-50 group-hover:opacity-100 transition-all">
                  {installCopied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </section>


            {/* Step 2 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">2</div>
                <h3 className="text-xl font-bold">Initialize in project</h3>
              </div>
              <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] overflow-hidden shadow-2xl group">
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all"
                  >
                    {snippetCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] uppercase font-black text-emerald-500 tracking-widest">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] uppercase font-black text-white/20 group-hover:text-white tracking-widest">Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-8 font-mono text-[13px] leading-relaxed overflow-x-auto text-indigo-300/90">
                  {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" /> Fetching your Project identity...
                    </div>
                  ) : codeSnippet}
                </pre>
              </div>

            </section>
          </div>

          <div className="space-y-8">
             <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-sm uppercase tracking-widest">Your API Key</h4>
                   </div>
                   <button 
                     onClick={() => setShowKey(!showKey)}
                     className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
                     title={showKey ? "Hide API Key" : "Show API Key"}
                   >
                     {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                </div>
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setKeyCopied(true);
                    setTimeout(() => setKeyCopied(false), 2000);
                  }}
                  className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[11px] break-all text-white/80 cursor-pointer hover:bg-white/5 transition-colors relative group/key flex items-center justify-between"
                >
                   <span>
                      {showKey ? apiKey : apiKey.substring(0, 3) + "•".repeat(12)}
                   </span>
                   <span className="text-[9px] font-black uppercase tracking-wider text-primary opacity-0 group-hover/key:opacity-100 transition-opacity ml-2">Copy</span>
                   {keyCopied && (
                     <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[10px] font-bold text-primary animate-in fade-in zoom-in duration-200">
                       COPIED!
                     </div>
                   )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Keep this key secret. It identifies your project and ensures data isolation in the Driftly cloud.
                </p>
             </div>

             <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   <h4 className="font-bold text-sm uppercase tracking-widest">Security</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Driftly SDK uses non-blocking asynchronous calls. It only analyzes schema structures and never transmits sensitive user data or PII.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

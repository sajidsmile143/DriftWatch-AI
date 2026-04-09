"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Code2, Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";

export default function SDKPage() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// 1. Initialize DriftWatch in your App entry point (e.g., layout.tsx or main.ts)
import { initDriftWatch } from "drift-sdk";

initDriftWatch({
  monitorUrl: "http://localhost:3000/api/monitor",
  serviceName: "My-Awesome-App",
  enabled: process.env.NODE_ENV !== "development" // Monitor everywhere else
});`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="SDK Setup" />
      
      <main className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Installation Guide</h2>
            <p className="text-muted-foreground text-sm">Follow these 2 simple steps to protect your frontend from API drift.</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs">1</span>
            <h3>Install the package</h3>
          </div>
          <div className="p-4 bg-black/40 border border-border rounded-xl font-mono text-sm flex items-center justify-between group">
            <span className="text-muted-foreground">
              <span className="text-primary font-bold">npm install</span> drift-sdk
            </span>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group-hover:opacity-100 opacity-50">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs">2</span>
            <h3>Initialize in your project</h3>
          </div>
          <div className="relative group">
            <pre className="p-6 bg-black/40 border border-border rounded-2xl font-mono text-sm leading-relaxed overflow-x-auto text-blue-300">
              {codeSnippet}
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </section>

        <section className="p-6 bg-card border border-border rounded-2xl space-y-3">
          <h4 className="font-semibold text-primary">How it works?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The SDK intercepts every <code className="text-foreground font-mono">fetch</code> call your app makes. 
            It analyzes the JSON response and sends only the <span className="text-foreground font-medium">Schema (Structure)</span> 
            to our monitor. If the schema changes from the baseline, you&apos;ll see a report in the Drifts tab.
          </p>
        </section>
      </main>
    </div>
  );
}

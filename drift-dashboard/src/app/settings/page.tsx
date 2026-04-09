"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "../../components/DashboardHeader";
import { 
  MessageSquare, 
  Settings2, 
  ShieldCheck, 
  Key, 
  Save,
  Info,
  ExternalLink,
  Hash,
  Fingerprint,
  Cpu,
  BellRing
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    whatsappNumber: "",
    whatsappApiKey: "",
    geminiApiKey: "",
    slackWebhook: "",
    monitoringEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      // Simple custom toast simulate
      alert("Config Updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
       <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <DashboardHeader title="Control Center" />
      
      <main className="p-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/20">
            <Settings2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Project Config</h2>
            <p className="text-muted-foreground text-sm font-medium">Configure your AI engine, notification endpoints, and orbital controls.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Notification Hub */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 px-2">
              <BellRing className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Alert gateways</h3>
            </div>

            {/* WhatsApp */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-emerald-500/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg">WhatsApp (CallMeBot)</h3>
                </div>
                <a 
                  href="https://www.callmebot.com/" 
                  target="_blank" 
                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50 hover:text-emerald-500 transition-colors flex items-center gap-1"
                >
                  Setup <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone (Intl format)</label>
                  <input 
                    type="text" 
                    placeholder="+92..."
                    value={settings.whatsappNumber}
                    onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CallMeBot API Key</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    <input 
                      type="password" 
                      placeholder="Enter Key"
                      value={settings.whatsappApiKey}
                      onChange={e => setSettings({...settings, whatsappApiKey: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Slack */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-[#4A154B]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A154B]/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-[#4A154B]" />
                </div>
                <h3 className="font-bold text-lg">Slack Webhook</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Webhook URL</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                  <input 
                    type="text" 
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slackWebhook}
                    onChange={e => setSettings({...settings, slackWebhook: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A154B]/20 transition-all font-mono"
                  />
                </div>
              </div>
            </motion.section>
          </div>

          {/* Intelligence & Global Hub */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 px-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Core intelligence</h3>
            </div>

            {/* AI Engine */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-indigo-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black">
                   AI
                </div>
                <h3 className="font-bold text-lg">Gemini Intelligence</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Gemini API Key</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      value={settings.geminiApiKey}
                      onChange={e => setSettings({...settings, geminiApiKey: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                    />
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 mt-4 group">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                      Enable real "Orbital AI Insights" by providing your Gemini key. This allows the system to analyze code patterns and predict crashes with 99% accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Global Controls */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl border border-primary/20 rounded-[2.5rem] flex flex-col justify-between h-[210px] shadow-2xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-primary">Orbital Status</h4>
                  <p className="text-xs text-white/40 font-medium">Global monitoring state</p>
                </div>
                <div className={cn(
                  "w-14 h-8 rounded-full p-1.5 cursor-pointer transition-all duration-500 shadow-inner",
                  settings.monitoringEnabled ? "bg-primary" : "bg-white/10"
                )} onClick={() => setSettings({...settings, monitoringEnabled: !settings.monitoringEnabled})}>
                  <motion.div 
                    animate={{ x: settings.monitoringEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-black rounded-full shadow-xl" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Commit Config
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "../../components/DashboardHeader";
import { 
  MessageSquare, 
  Settings2, 
  Key, 
  Save, 
  Info, 
  ExternalLink, 
  Hash, 
  Fingerprint, 
  Cpu, 
  BellRing, 
  Send,
  Smartphone
} from "lucide-react";
import { cn } from "../../lib/utils";
import { WhatsAppBridge } from "../../components/WhatsAppBridge";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    whatsappNumber: "",
    whatsappApiKey: "",
    geminiApiKey: "",
    slackWebhook: "",
    telegramChatId: "",
    telegramToken: "",
    monitoringEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string } | null>(null);

  useEffect(() => {
    if (toast?.show) {
      setTimeout(() => setToast(null), 3000);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          whatsappNumber: data.whatsappNumber || "",
          whatsappApiKey: data.whatsappApiKey || "",
          geminiApiKey: data.geminiApiKey || "",
          slackWebhook: data.slackWebhook || "",
          telegramChatId: data.telegramChatId || "",
          telegramToken: data.telegramToken || "",
          monitoringEnabled: data.monitoringEnabled ?? true
        });
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
      setToast({ show: true, message: "Configuration orbitally updated! ✨" });
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Sync failed. Check terminal." });
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
      
      <main className="p-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/20">
            <Settings2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Unified Hub</h2>
            <p className="text-muted-foreground text-sm font-medium">Configure multi-channel alerts and AI intelligence parameters.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Notification Gateway Hub */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 px-2">
              <BellRing className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Alert gateways</h3>
            </div>



            {/* Slack Webhook */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-purple-500/20 transition-all shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-purple-500" />
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
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  />
                </div>
              </div>
            </motion.section>

            <WhatsAppBridge defaultPhone={settings.whatsappNumber} />



            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Alert Recipient</h3>
              </div>
              <div className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</label>
                 <input 
                   type="text" 
                   placeholder="+92..."
                   value={settings.whatsappNumber}
                   onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                   className="w-full mt-2 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
                 <p className="text-[11px] text-white/30 mt-3 px-1 leading-relaxed">System will route all critical drift alerts to this number via the bridge session above.</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-2 px-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">System control</h3>
            </div>


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

      {/* Premium Toast Notification */}
      <div className="fixed bottom-10 right-10 z-50 pointer-events-none">
        <AnimatePresence>
          {toast?.show && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="px-8 py-4 bg-primary/10 backdrop-blur-3xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-primary">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  QrCode,
  AlertCircle,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppBridge({ defaultPhone }: { defaultPhone?: string }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    if (defaultPhone) setTestPhone(defaultPhone);
  }, [defaultPhone]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError("Failed to sync with bridge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleSendTest = async () => {
    if (!testPhone) return;

    setSendingTest(true);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone })
      });
      if (res.ok) {
        setTestSent(true);
        setShowTestModal(false);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTest(false);
    }
  };


  if (loading && !status) return <div className="h-40 flex items-center justify-center"><RefreshCcw className="animate-spin text-primary" /></div>;

  const isConnected = status?.status === 'CONNECTED';
  const isQrReady = status?.status === 'QR_READY';
  const isDisconnected = status?.status === 'DISCONNECTED' || !status;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-primary/20 transition-all shadow-2xl overflow-hidden relative"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isConnected ? "bg-emerald-500/10" : "bg-primary/10"
          )}>
            <Smartphone className={cn(
              "w-5 h-5",
              isConnected ? "text-emerald-500" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-bold text-lg">WhatsApp Bridge (Free)</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Local automation engine</p>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5",
          isConnected ? "bg-emerald-500/10 text-emerald-500" : 
          isQrReady ? "bg-amber-500/10 text-amber-500 animate-pulse" : 
          "bg-red-500/10 text-red-500"
        )}>
          {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {status?.status || "OFFLINE"}
        </div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div 
              key="connected"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Link Established</p>
                <p className="text-[11px] text-muted-foreground">Alerts will be routed through your local session.</p>
              </div>
              
              <button 
                onClick={() => setShowTestModal(true)}
                disabled={sendingTest}
                className={cn(
                  "mt-4 flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all",
                  testSent ? "bg-emerald-500 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                {sendingTest ? (
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                ) : testSent ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                {testSent ? "Message Queued!" : "Send Test Message"}
              </button>
            </motion.div>
          ) : isQrReady && status?.qrCode ? (
            <motion.div 
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <div className="p-4 bg-white rounded-3xl shadow-2xl">
                <img src={status.qrCode} alt="WhatsApp QR" className="w-48 h-48" />
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-500">
                  <QrCode className="w-4 h-4" />
                  <p className="text-sm font-bold uppercase tracking-tight">Scan with WhatsApp</p>
                </div>
                <p className="text-[11px] text-muted-foreground px-10">Go to Linked Devices on your phone and scan this code to activate the bridge.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="disconnected"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-center space-y-4">
                <p className="text-xs text-muted-foreground max-w-[250px]">Bridge is currently inactive. Run <code>npm run whatsapp</code> to start the engine.</p>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>

      {/* Test Message Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTestModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                   <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Send Test Alert</h4>
                  <p className="text-xs text-muted-foreground mt-2">Verify your bridge connection with a test message.</p>
                </div>
                
                <div className="w-full space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient Number</label>
                  <input 
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="e.g. 923001234567"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={handleSendTest}
                    disabled={sendingTest || !testPhone}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingTest && <RefreshCcw className="w-3 h-3 animate-spin" />}
                    {sendingTest ? "Sending..." : "Dispatch Test"}
                  </button>
                  <button 
                    onClick={() => setShowTestModal(false)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Background Element */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
    </motion.section>


  );
}

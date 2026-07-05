"use client";

import { useEffect, useState, useRef } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashboardHeader({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-400 p-[1px] hover:scale-105 active:scale-95 transition-all focus:outline-none"
        >
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0c0c0e]/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {user && (
              <div className="px-3 py-2.5 border-b border-white/5 flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Logged in as</span>
                <span className="text-xs font-semibold text-white/80 truncate">{user.email}</span>
              </div>
            )}
            
            <div className="mt-1.5 space-y-1">
              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Settings
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-400/5 transition-all font-medium text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

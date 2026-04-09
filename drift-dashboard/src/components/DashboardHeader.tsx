import { Bell, Search, User } from "lucide-react";

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search API services..."
            className="bg-accent/50 border border-border rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-400 p-[1px]">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}

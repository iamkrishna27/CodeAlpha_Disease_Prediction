import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="h-16 bg-background/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Patient ID, Name, Report..." 
            className="bg-gray-900 border border-gray-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-primary text-gray-200 w-[280px] transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10B981]"></div>
            <span className="text-success tracking-widest uppercase">API ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10B981]"></div>
            <span className="text-success tracking-widest uppercase">MODEL READY</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#06B6D4]"></div>
            <span className="text-primary tracking-widest uppercase">AI ACTIVE</span>
          </div>
        </div>
        
        <div className="h-6 w-px bg-gray-800"></div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-primary transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background"></span>
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <UserCircle size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

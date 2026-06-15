import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Heart, TestTube, Brain, History, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeModule, setActiveModule }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('userProfile');
    if (data) {
      try {
        setProfile(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse user profile");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diabetes', label: 'Diabetes', subtitle: 'Endocrinology', icon: Activity },
    { id: 'heart', label: 'Heart Disease', subtitle: 'Cardiology', icon: Heart },
    { id: 'kidney', label: 'Kidney Disease', subtitle: 'Nephrology', icon: TestTube },
    { id: 'parkinsons', label: 'Parkinson\'s', subtitle: 'Neurology', icon: Brain },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-gray-800 flex flex-col h-full hidden md:flex">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-primary tracking-widest">MED-CORE OS</h2>
        <div className="flex items-center gap-2 mt-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10B981]"></div>
          <span className="text-xs text-success uppercase tracking-wider font-semibold">System Active</span>
        </div>
        
        <div className="bg-[#0b101a] border border-gray-800 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 shrink-0">
            <User size={20} className="text-primary" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Welcome,</p>
            <p className="text-sm text-gray-200 font-medium truncate">
              {profile && profile.firstName ? `Dr. ${profile.firstName} ${profile.lastName}` : 'Dr. Admin'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border-l-[3px] border-primary shadow-[inset_4px_0_10px_-4px_rgba(6,182,212,0.3)]' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/80 border-l-[3px] border-transparent hover:border-gray-500'
              }`}
            >
              <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <div className="flex flex-col items-start text-left">
                <span>{item.label}</span>
                {item.subtitle && <span className="text-xs text-gray-500 font-normal mt-0.5">{item.subtitle}</span>}
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-danger hover:bg-danger/10 hover:border-danger/30 border border-transparent transition-all group shadow-[0_0_10px_rgba(0,0,0,0)] hover:shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]"
        >
          <LogOut size={16} />
          SECURE LOGOUT
        </button>
        <div className="text-[10px] text-gray-600 text-center font-mono uppercase tracking-widest">
          v2.0.0 Enterprise
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

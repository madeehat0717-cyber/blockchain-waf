import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LayoutDashboard, Activity, ShieldAlert, List, Lock, CheckCircle, BarChart3, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: "/", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { to: "/monitor", icon: <Activity className="w-5 h-5" />, label: "WAF Monitor" },
    { to: "/rules", icon: <List className="w-5 h-5" />, label: "Firewall Rules" },
    { to: "/events", icon: <ShieldAlert className="w-5 h-5" />, label: "Security Events" },
    { to: "/ips", icon: <Lock className="w-5 h-5" />, label: "IP Access Control" },
    { to: "/verification", icon: <CheckCircle className="w-5 h-5" />, label: "Blockchain Verification" },
    { to: "/demo", icon: <ShieldCheck className="w-5 h-5" />, label: "Protected Demo" },
    { to: "/analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: "/users", icon: <Users className="w-5 h-5" />, label: "Users" });
    navItems.push({ to: "/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" });
  }

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
        <ShieldCheck className="text-slate-600 w-8 h-8" />
        <div>
          <h2 className="text-slate-900 font-semibold tracking-wider text-sm">SECURITY CENTER</h2>
          <div className="text-[10px] text-slate-500 font-mono uppercase">WAF / Node Online</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3 py-2 rounded-sm text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-gray-800 text-slate-900' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-sm bg-gray-800 flex items-center justify-center text-slate-800 font-bold border border-slate-200">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-sm text-slate-800 font-medium">{user?.username}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center space-x-3 text-slate-500 hover:text-slate-800 px-2 py-2 w-full text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Bell,
  UserCheck
} from 'lucide-react';
import useStudioStore from '../store/studioStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { appVersion } = useStudioStore();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Helper to determine active route for custom styling
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-screen bg-studio-bg text-studio-text overflow-hidden font-sans">
      {/* Sidebar: Premium Dark Charcoal */}
      <aside className="w-[260px] bg-studio-sidebar text-white flex flex-col justify-between flex-shrink-0 h-full border-r border-gray-800">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold tracking-wider text-studio-gold">Media Mirror</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Premium Studio Management</p>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 group text-[18px] font-medium select-none ${
                    active
                      ? 'bg-studio-accent text-white shadow-lg shadow-indigo-600/10'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-200 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} 
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin User Footer Profile */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-studio-gold/20 border border-studio-gold/40 flex items-center justify-center text-studio-gold font-bold">
              AU
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white leading-tight">Admin User</h4>
              <p className="text-xs text-gray-400 leading-tight">Studio Administrator</p>
            </div>
          </div>
          <NavLink 
            to="/settings" 
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Settings size={20} />
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-studio-bg">
        {/* Top Header */}
        <header className="h-[76px] border-b border-studio-border bg-white flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold px-3 py-1 rounded bg-studio-gold/10 text-studio-gold border border-studio-gold/20 uppercase tracking-wider">
              Studio Owner View
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick System Notifications */}
            <button className="text-studio-muted hover:text-studio-text p-2 rounded-full hover:bg-studio-bg transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-studio-accent animate-pulse"></span>
            </button>
            
            <div className="h-6 w-[1px] bg-studio-border"></div>

            <div className="flex items-center gap-3 select-none">
              <div className="text-right">
                <p className="text-[15px] font-medium text-studio-text leading-tight">Media Mirror Studio</p>
                <p className="text-xs text-studio-muted leading-tight">v{appVersion}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-studio-accent/10 flex items-center justify-center text-studio-accent">
                <UserCheck size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto p-8 relative page-enter">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

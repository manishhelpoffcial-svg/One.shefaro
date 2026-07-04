import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Truck,
  Coins,
  ShieldCheck,
  FileText,
  CreditCard,
  LifeBuoy,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { AdminSection, AdminSession } from '../types';

interface AdminLayoutProps {
  session: AdminSession;
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  session,
  currentSection,
  onNavigate,
  onLogout,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'User Accounts', icon: <Users className="w-5 h-5" /> },
    { id: 'shipments', label: 'Shipments', icon: <Truck className="w-5 h-5" /> },
    { id: 'pricing', label: 'Pricing & Promos', icon: <Coins className="w-5 h-5" /> },
    { id: 'partners', label: 'Courier Partners', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'content', label: 'Page Content', icon: <FileText className="w-5 h-5" /> },
    { id: 'finance', label: 'Finance & Refunds', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'support', label: 'Support Tickets', icon: <LifeBuoy className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Audit', icon: <SettingsIcon className="w-5 h-5" /> }
  ] as const;

  const currentItem = menuItems.find((item) => item.id === currentSection);

  const handleNavClick = (sectionId: AdminSection) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      {/* Brand Logo/Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25">
          S
        </div>
        <div>
          <span className="font-semibold text-base tracking-tight text-white block">one.shefaro</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Super Admin</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.id === currentSection;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
            {session.email.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{session.email}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase">{session.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition-all duration-150 border border-slate-700 hover:border-red-500 min-h-[38px] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Slide-in */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Sidebar Container */}
        <div className={`fixed top-0 bottom-0 left-0 w-64 shadow-2xl transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
          {/* Close button outside */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-[-48px] p-2 bg-slate-950 text-white rounded-lg hover:bg-slate-900 focus:outline-none min-h-[44px] min-w-[44px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-700 min-h-[44px] min-w-[44px] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title & Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="hover:text-slate-600 transition-colors">Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 font-bold">{currentItem?.label || 'Panel'}</span>
            </div>
            <div className="sm:hidden font-bold text-slate-800 text-sm">
              {currentItem?.label || 'Panel'}
            </div>
          </div>

          {/* Quick Stats / Info Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-extrabold tracking-wide uppercase select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Security Shield Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Panel Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

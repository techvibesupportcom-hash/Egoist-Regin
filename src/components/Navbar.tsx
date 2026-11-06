import React, { useState } from 'react';
import { UserSession, NotificationItem } from '../types.ts';
import { Trophy, FileText, Shield, Users, Dumbbell, Target, BookOpen, Bot, Bell, Key, Menu, X, Check } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentSession: UserSession;
  onOpenLogin: () => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentSession,
  onOpenLogin,
  notifications,
  onMarkNotificationsRead,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.leido).length;

  const navItems = [
    { id: 'ranking', label: 'Ranking Mercado', icon: Trophy },
    { id: 'ficha', label: 'Mi Ficha', icon: FileText },
    { id: 'clubes', label: 'Clubes & Clanes', icon: Users },
    { id: 'entrenamientos', label: 'Entrenamientos 24h', icon: Dumbbell },
    { id: 'calculadoras', label: 'Calculadoras del Ego', icon: Target },
    { id: 'guia', label: 'Renacimientos & Ojos', icon: BookOpen },
    { id: 'ia', label: 'Jinpachi Ego IA', icon: Bot },
    ...(currentSession.role === 'admin'
      ? [{ id: 'admin', label: 'Panel Admins', icon: Shield, badge: '5 Admins' }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050711]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Community title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('ranking')}>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="text-base font-chakra font-black tracking-wider text-white flex items-center gap-2">
                <span>BLUE LOCK</span>
                <span className="text-[10px] font-mono font-normal bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                  REIGN OF EGOISTS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
                日本の天才 • Rol Oficial & Mercado de Yenes
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-chakra font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right session & Notifications */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-[#080d1e] border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-2">
                  <div className="flex justify-between items-center px-1 pb-1 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase text-slate-300 font-bold">Notificaciones</span>
                    <span className="text-[10px] font-mono text-cyan-400">{notifications.length} avisos</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <div className="text-slate-500 text-center py-4 font-mono">Sin notificaciones</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-chakra font-bold text-white text-[11px]">{n.titulo}</span>
                            <span className="text-[9px] font-mono text-slate-500">
                              {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-tight">{n.mensaje}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Session Button / Login */}
            <button
              onClick={onOpenLogin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-chakra font-bold transition ${
                currentSession.role === 'admin'
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 hover:bg-purple-900/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {currentSession.role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate max-w-[120px]">{currentSession.username}</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{currentSession.username || 'Acceso Admins'}</span>
                </>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-xs font-chakra font-bold transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900/60 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

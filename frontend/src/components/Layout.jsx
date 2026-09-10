import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, PlusCircle, Inbox, BarChart2, MessageSquare, 
  Settings, ChevronLeft, ChevronRight, Search, Bell, Sparkles
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new', label: 'New Ticket', icon: PlusCircle },
    { path: '/inbox', label: 'Inbox', icon: Inbox },
    { path: '/analytics', label: 'AI Analytics', icon: BarChart2 },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path))?.label || 'SmartDesk';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="h-full glass flex flex-col z-30 relative shrink-0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shrink-0 gradient-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden ml-3"
              >
                <h1 className="text-lg font-bold text-white whitespace-nowrap">SmartDesk</h1>
                <p className="text-[10px] text-slate-400 font-medium -mt-0.5 whitespace-nowrap">AI Ticket Router</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border border-indigo-500/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
          <div>
            <h2 className="text-lg font-semibold text-white">{currentPage}</h2>
            <p className="text-xs text-slate-400 -mt-0.5">{getGreeting()}, Admin</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="glass-input pl-9 pr-4 py-2 rounded-xl text-sm w-56 focus:w-72 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-dark-800" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-200 leading-tight">Admin</p>
                <p className="text-[11px] text-slate-400 leading-tight">admin@smartdesk.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with transitions */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, Inbox, BarChart2, MessageSquare,
  Settings, ChevronLeft, ChevronRight, Search, Bell, Zap,
  LogOut, HelpCircle, Bot
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new', label: 'New Ticket', icon: PlusCircle },
    { path: '/inbox', label: 'Inbox', icon: Inbox },
    { path: '/analytics', label: 'AI Analytics', icon: BarChart2 },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path))?.label || 'SmartDesk';

  const sidebarW = collapsed ? 64 : 240;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#09090B' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="h-full flex flex-col z-30 relative shrink-0 sidebar-bg"
      >
        {/* Logo */}
        <div className="h-[52px] flex items-center px-4 border-b" style={{ borderColor: '#27272A' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo mark */}
            <div
              className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
              style={{ background: '#6366F1' }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden flex items-center gap-1.5 min-w-0"
                >
                  <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap tracking-tight">
                    SmartDesk
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                style={collapsed ? { padding: '8px', justifyContent: 'center' } : {}}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-[13px]"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t px-2 py-2 space-y-0.5" style={{ borderColor: '#27272A' }}>
          <button
            className="nav-item w-full text-left"
            style={collapsed ? { padding: '8px', justifyContent: 'center' } : {}}
            title={collapsed ? 'Help' : undefined}
          >
            <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="text-[13px]">Help & Docs</span>}
          </button>

          {/* User info */}
          <div
            className="flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 mt-1"
            style={{ borderTop: '1px solid #27272A', paddingTop: '8px', marginTop: '4px' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[11px] shrink-0"
              style={{ background: '#6366F1' }}
            >
              A
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden flex-1 min-w-0"
                >
                  <p className="text-[12px] font-medium text-zinc-200 truncate leading-tight">Admin</p>
                  <p className="text-[10px] text-zinc-500 truncate leading-tight">admin@smartdesk.ai</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button className="btn-icon p-1 shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full mt-1"
            style={collapsed ? { padding: '8px', justifyContent: 'center' } : { justifyContent: 'space-between' }}
          >
            {!collapsed && <span className="text-[12px] text-zinc-500">Collapse</span>}
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="h-[52px] topbar-bg flex items-center justify-between px-5 shrink-0 z-20"
        >
          {/* Left: Page title */}
          <div className="flex items-center gap-3">
            <h1 className="text-[14px] font-semibold text-zinc-100 tracking-tight">{currentPage}</h1>
            <span
              className="hidden sm:block text-[11px] px-1.5 py-0.5 rounded"
              style={{ background: '#1C1C1F', color: '#52525B', border: '1px solid #27272A' }}
            >
              SmartDesk AI
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#52525B' }} />
              <input
                type="text"
                placeholder="Search tickets... ⌘K"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="input-base pl-8 pr-3 py-1.5 text-[13px]"
                style={{ width: searchFocused ? '220px' : '180px', transition: 'width 0.2s ease' }}
              />
            </div>

            {/* AI Status */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium"
              style={{ background: '#1C1C1F', border: '1px solid #27272A', color: '#22C55E' }}
              title="AI Model Status"
            >
              <span className="status-online" />
              <span>AI Online</span>
            </div>

            {/* Notifications */}
            <button className="btn-icon relative">
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: '#6366F1' }}
              />
            </button>

            {/* Avatar divider + user */}
            <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid #27272A' }}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[11px] cursor-pointer"
                style={{ background: '#6366F1' }}
              >
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ background: '#09090B' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
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

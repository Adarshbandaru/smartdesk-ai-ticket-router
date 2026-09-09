import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Inbox, BarChart2, MessageSquare } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new', label: 'New Ticket', icon: PlusCircle },
    { path: '/inbox', label: 'Inbox', icon: Inbox },
    { path: '/analytics', label: 'AI Analytics', icon: BarChart2 },
    { path: '/feedback', label: 'Feedback Queue', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">SmartDesk</h1>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'SmartDesk'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
                A
              </div>
              <span className="text-sm font-medium text-slate-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

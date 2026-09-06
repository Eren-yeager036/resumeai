import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, HelpCircle, LogOut, Sparkles, User, Bell, Moon, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 md:relative bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden shadow-2xl md:shadow-none ${isSidebarOpen ? 'w-[280px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full md:translate-x-0 border-none'}`}>
        <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">ResumeAI</span>
          </div>
        </div>
        
        <div className="flex-1 w-[280px]">
          {/* Navigation options removed as requested */}
        </div>
        
        <div className="p-6 border-t border-gray-100 w-[280px]">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-2xl transition-all font-semibold text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        {/* Top Navbar */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <div className={`flex items-center gap-3 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
              <span className="text-xl font-bold tracking-tight text-gray-900">ResumeAI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
              <Moon size={20} />
            </button>
            <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-transparent p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

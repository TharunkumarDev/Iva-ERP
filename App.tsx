
import React, { useState } from 'react';
import { User, UserRole } from './types';
import { AuthScreen } from './screens/Auth';
import { StudentDashboard } from './screens/StudentDashboard';
import { TeacherDashboard } from './screens/TeacherDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
import { ProfileScreen } from './screens/Profile';
import { Home, LogOut, Bell, Menu, X, User as UserIcon } from 'lucide-react';

// REPLACE THIS URL WITH YOUR ACTUAL LOGO URL
const LOGO_URL = "https://placehold.co/400x400/3b82f6/ffffff?text=IVA+Music+Academy";

// --- Sidebar Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} className={`${!active && 'group-hover:scale-110 transition-transform'}`} />
    <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>{label}</span>
  </button>
);

const Sidebar = ({ role, activeTab, onNavigate, onLogout, isOpen, onClose, logoUrl }: { role: UserRole, activeTab: string, onNavigate: (tab: string) => void, onLogout: () => void, isOpen: boolean, onClose: () => void, logoUrl: string }) => (
  <>
    {/* Mobile Overlay */}
    {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose}></div>}

    <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 flex flex-col p-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      {/* Brand */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt="IVA Music Academy" 
            className="w-10 h-10 rounded-xl shadow-blue-200 shadow-lg object-contain bg-white" 
          />
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">IVA Music</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academy Portal</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <div className="space-y-2 flex-1">
        <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</div>
        <SidebarItem icon={Home} label="Dashboard" active={activeTab === 'dash'} onClick={() => { onNavigate('dash'); onClose(); }} />
        <SidebarItem icon={UserIcon} label="My Profile" active={activeTab === 'profile'} onClick={() => { onNavigate('profile'); onClose(); }} />
        <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => { onNavigate('notifications'); onClose(); }} />
      </div>

      {/* User Profile / Logout */}
      <div className="mt-auto pt-6 border-t border-slate-50">
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 group">
          <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  </>
);

// --- Main Layout ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dash');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentTab('dash');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab('dash');
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} logoUrl={LOGO_URL} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
      <Sidebar 
        role={user.role} 
        activeTab={currentTab} 
        onNavigate={setCurrentTab} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoUrl={LOGO_URL}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src={LOGO_URL} 
                alt="IVA Logo" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="font-bold text-slate-800">IVA Music Academy</span>
            </div>
          </div>
          <img 
            src={user.avatar} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer"
            onClick={() => setCurrentTab('profile')}
          />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {currentTab === 'profile' ? (
               <ProfileScreen user={user} onUpdateUser={setUser} />
             ) : (
               <>
                 {user.role === UserRole.STUDENT && <StudentDashboard user={user} onNavigate={setCurrentTab} />}
                 {user.role === UserRole.TEACHER && <TeacherDashboard user={user} onNavigate={setCurrentTab} />}
                 {user.role === UserRole.ADMIN && <AdminDashboard user={user} onNavigate={setCurrentTab} />}
               </>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

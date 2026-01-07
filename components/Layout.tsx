
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useBirthdays } from '../context/BirthdayContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markNotificationRead, permissionError, retryConnection } = useBirthdays();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Aniversariantes', path: '/list' },
    { icon: PlusCircle, label: 'Novo Cadastro', path: '/new' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Permission Error Banner */}
      {permissionError && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium animate-in slide-in-from-top duration-300 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro de Permissão: O banco de dados está bloqueado.</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              className="underline font-bold hover:text-amber-100 transition-colors"
            >
              Corrigir Regras no Console
            </button>
            <button 
              onClick={retryConnection}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className={`md:hidden bg-white/80 backdrop-blur-md border-b px-5 py-4 flex items-center justify-between sticky top-0 z-50 ${permissionError ? 'mt-24 sm:mt-12' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm shadow-indigo-100">
            <Calendar className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">BdayHub</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${permissionError ? 'md:pt-12' : ''}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="text-white h-6 w-6" />
            </div>
            <span className="font-bold text-2xl text-slate-800 tracking-tight">BdayHub</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
            >
              <LogOut className="h-5 w-5" />
              Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Nav */}
        <header className={`hidden md:flex bg-white border-b px-8 py-4 items-center justify-between sticky top-0 z-30 ${permissionError ? 'mt-12' : ''}`}>
          <h1 className="text-lg font-semibold text-slate-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'BdayHub'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                    <span className="font-semibold text-slate-700">Notificações</span>
                    {unreadCount > 0 && <span className="text-xs text-indigo-600 font-medium">{unreadCount} novas</span>}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma notificação por enquanto.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setIsNotifOpen(false);
                            navigate('/list');
                          }}
                          className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2">
                                {new Date(notif.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t bg-slate-50/50">
                    <button onClick={() => setIsNotifOpen(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Fechar</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Usuário'}</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                <span className="text-indigo-700 font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

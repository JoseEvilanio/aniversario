
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
  RefreshCw,
  Gift,
  ChevronRight
} from 'lucide-react';
import { useBirthdays } from '../context/BirthdayContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { calculateAge, daysUntil } from '../utils';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showBdayModal, setShowBdayModal] = useState(false);
  const { birthdays, notifications, unreadCount, markNotificationRead, permissionError, retryConnection } = useBirthdays();
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

  const todayBdays = birthdays.filter(b => {
    const [year, month, day] = b.birthDate.split('-').map(Number);
    const bdayDate = new Date(year, month - 1, day);
    const today = new Date();

    return bdayDate.getMonth() === today.getMonth() && bdayDate.getDate() === today.getDate();
  });

  React.useEffect(() => {
    if (todayBdays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastShown = localStorage.getItem(`bday_notif_${user?.uid}_${today}`);

      if (!lastShown) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Aniversariantes de Hoje! 🎂', {
              body: `Hoje temos ${todayBdays.length} aniversariante(s)!`,
              icon: '/favicon.ico'
            });
          } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        } else {
          setShowBdayModal(true);
        }
        localStorage.setItem(`bday_notif_${user?.uid}_${today}`, 'true');
      }
    }
  }, [todayBdays.length, user?.uid]);

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
          <div className="relative">
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

            {/* Notifications Dropdown (Mobile) */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-40px)] bg-white rounded-2xl shadow-2xl border overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                  <span className="font-semibold text-slate-700">Notificações</span>
                  {unreadCount > 0 && <span className="text-xs text-indigo-600 font-medium">{unreadCount} novas</span>}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
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
        fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${permissionError ? 'md:pt-12' : ''}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="text-white h-6 w-6" />
            </div>
            <span className="font-bold text-2xl text-slate-800 tracking-tight">BdayHub</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden ml-auto p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
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
      <main className="flex-1 flex flex-col md:pl-64">
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
                <div className="absolute right-0 mt-3 w-[calc(100vw-40px)] sm:w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
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

      {/* Modal de Aniversariantes do Dia (Desktop) */}
      {showBdayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <Gift className="absolute -top-4 -left-4 w-32 h-32 rotate-12" />
                <Gift className="absolute -bottom-4 -right-4 w-32 h-32 -rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <Gift className="text-white h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Aniversariantes de Hoje! 🎂</h2>
                <p className="text-indigo-100 mt-2">Não esqueça de dar os parabéns!</p>
              </div>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {todayBdays.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                        {b.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{b.fullName}</p>
                        <p className="text-sm text-slate-500">Fazendo {calculateAge(b.birthDate)} anos</p>
                      </div>
                    </div>
                    <Link
                      to="/list"
                      onClick={() => setShowBdayModal(false)}
                      className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowBdayModal(false);
                  navigate('/list');
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Ver Lista Completa
              </button>
              <button
                onClick={() => setShowBdayModal(false)}
                className="w-full py-3 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
              >
                Lembrar depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

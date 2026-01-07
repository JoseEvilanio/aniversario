
import React from 'react';
import { useBirthdays } from '../context/BirthdayContext';
import { calculateAge, daysUntil, formatShortDate } from '../utils';
import { CATEGORY_COLORS } from '../constants';
import { Users, Cake, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { birthdays } = useBirthdays();

  const todayBdays = birthdays.filter(b => {
    const d = daysUntil(b.birthDate);
    return d === 0 || d === 365 || d === 366;
  });

  const upcomingBdays = birthdays
    .filter(b => {
      const d = daysUntil(b.birthDate);
      return d > 0 && d <= 30;
    })
    .sort((a, b) => daysUntil(a.birthDate) - daysUntil(b.birthDate))
    .slice(0, 5);

  const stats = [
    { label: 'Total Cadastrados', value: birthdays.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Aniversários Hoje', value: todayBdays.length, icon: Cake, color: 'bg-rose-500' },
    { label: 'Próximos 30 dias', value: birthdays.filter(b => daysUntil(b.birthDate) <= 30).length, icon: Calendar, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Olá, Admin! 👋</h2>
          <p className="text-slate-500 mt-1">Bem-vindo ao seu painel de aniversários.</p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 md:py-2.5 rounded-2xl md:rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 w-full md:w-auto"
        >
          <Cake className="h-5 w-5 md:h-4 md:w-4" />
          Novo Aniversariante
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:bg-slate-50/50 md:active:scale-100 active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-2xl md:rounded-xl text-white shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Cake className="h-5 w-5 text-rose-500" />
              Aniversários de Hoje
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[200px]">
            {todayBdays.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                <p className="text-sm font-medium">Nenhum aniversário hoje.</p>
              </div>
            ) : (
              <div className="divide-y">
                {todayBdays.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {b.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{b.fullName}</p>
                        <p className="text-xs text-slate-500">Está fazendo {calculateAge(b.birthDate)} anos hoje!</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${CATEGORY_COLORS[b.category]}`}>
                      {b.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Próximos Aniversários
            </h3>
            <Link to="/list" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[200px]">
            {upcomingBdays.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                <p className="text-sm font-medium">Sem aniversários próximos.</p>
              </div>
            ) : (
              <div className="divide-y">
                {upcomingBdays.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-xl text-slate-600">
                        <span className="text-xs font-bold leading-none">{new Date(b.birthDate).getDate()}</span>
                        <span className="text-[10px] font-medium uppercase">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(b.birthDate))}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{b.fullName}</p>
                        <p className="text-xs text-slate-500">Em {daysUntil(b.birthDate)} dias ({calculateAge(b.birthDate) + 1} anos)</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${CATEGORY_COLORS[b.category]}`}>
                      {b.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

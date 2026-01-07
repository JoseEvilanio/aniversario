
import React, { useState, useMemo } from 'react';
import { useBirthdays } from '../context/BirthdayContext';
import { calculateAge, daysUntil, formatDateBr } from '../utils';
import { CATEGORY_COLORS } from '../constants';
import { Search, Filter, Edit2, Trash2, Mail, Phone, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BirthdayList: React.FC = () => {
  const { birthdays, deleteBirthday } = useBirthdays();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  const filteredBirthdays = useMemo(() => {
    return birthdays
      .filter(b => {
        const matchesSearch = b.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const d = daysUntil(b.birthDate);
        let matchesFilter = true;

        if (activeFilter === 'today') matchesFilter = d === 0 || d === 365 || d === 366;
        if (activeFilter === '7days') matchesFilter = d >= 0 && d <= 7;
        if (activeFilter === '30days') matchesFilter = d >= 0 && d <= 30;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => daysUntil(a.birthDate) - daysUntil(b.birthDate));
  }, [birthdays, searchTerm, activeFilter]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir o aniversário de ${name}?`)) {
      deleteBirthday(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Aniversariantes</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          <Link to="/new" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 sm:py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2">
            <PlusCircle className="h-4 w-4 md:hidden" />
            Cadastrar Novo
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'today', label: 'Hoje' },
          { id: '7days', label: 'Próximos 7 dias' },
          { id: '30days', label: 'Próximos 30 dias' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pessoa</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nascimento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Idade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBirthdays.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Nenhum aniversariante encontrado.
                </td>
              </tr>
            ) : (
              filteredBirthdays.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${CATEGORY_COLORS[b.category]}`}>
                        {b.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{b.fullName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{b.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDateBr(b.birthDate)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">{calculateAge(b.birthDate)} anos</p>
                  </td>
                  <td className="px-6 py-4">
                    {daysUntil(b.birthDate) === 0 || daysUntil(b.birthDate) === 365 || daysUntil(b.birthDate) === 366 ? (
                      <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase animate-pulse">Hoje! 🎂</span>
                    ) : (
                      <span className="text-xs text-slate-500">Em {daysUntil(b.birthDate)} dias</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/edit/${b.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id, b.fullName)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {filteredBirthdays.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 col-span-full">
            Nenhum aniversariante encontrado.
          </div>
        ) : (
          filteredBirthdays.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-300 active:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl shadow-inner ${CATEGORY_COLORS[b.category]}`}>
                    {b.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight text-lg line-clamp-1">{b.fullName}</h4>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${CATEGORY_COLORS[b.category].replace('bg-', 'bg-opacity-20 text-').replace('-100', '-700')} bg-slate-100`}>
                      {b.category}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-indigo-600 tracking-tighter">{calculateAge(b.birthDate)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Anos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 mb-1 font-bold uppercase tracking-tighter text-[9px]">Aniversário</p>
                  <p className="font-bold text-slate-700">{formatDateBr(b.birthDate)}</p>
                </div>
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                  <p className="text-indigo-400 mb-1 font-bold uppercase tracking-tighter text-[9px]">Status</p>
                  <p className="font-black text-indigo-700">
                    {daysUntil(b.birthDate) === 0 || daysUntil(b.birthDate) === 365 || daysUntil(b.birthDate) === 366
                      ? 'HOJE 🎂'
                      : `${daysUntil(b.birthDate)} dias`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-2.5">
                  {b.email && (
                    <a href={`mailto:${b.email}`} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-90">
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                  {b.phone && (
                    <a href={`tel:${b.phone}`} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-90">
                      <Phone className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link to={`/edit/${b.id}`} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-bold text-sm flex items-center gap-2">
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(b.id, b.fullName)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BirthdayList;

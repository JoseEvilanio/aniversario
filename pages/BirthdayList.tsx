
import React, { useState, useMemo } from 'react';
import { useBirthdays } from '../context/BirthdayContext';
import { calculateAge, daysUntil, formatDateBr } from '../utils';
import { CATEGORY_COLORS } from '../constants';
import { Search, Filter, Edit2, Trash2, Mail, Phone } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Todos os Aniversários</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <Link to="/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 flex-shrink-0">
            Cadastrar
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
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === filter.id 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
        {filteredBirthdays.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${CATEGORY_COLORS[b.category]}`}>
                  {b.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{b.fullName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${CATEGORY_COLORS[b.category]}`}>
                    {b.category}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-indigo-600">{calculateAge(b.birthDate)}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Anos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-slate-400 mb-1 font-medium">Aniversário</p>
                <p className="font-bold text-slate-700">{formatDateBr(b.birthDate)}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-slate-400 mb-1 font-medium">Status</p>
                <p className="font-bold text-indigo-600">{daysUntil(b.birthDate) === 0 ? 'HOJE 🎂' : `${daysUntil(b.birthDate)} dias`}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                {b.email && (
                  <a href={`mailto:${b.email}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {b.phone && (
                  <a href={`tel:${b.phone}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/edit/${b.id}`} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(b.id, b.fullName)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayList;

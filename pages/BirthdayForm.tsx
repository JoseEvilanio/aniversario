
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useBirthdays } from '../context/BirthdayContext';
import { CATEGORIES } from '../constants';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { Birthday, Category } from '../types';
import { formatPhone } from '../utils';

const BirthdayForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addBirthday, updateBirthday, birthdays } = useBirthdays();

  const [formData, setFormData] = useState<Omit<Birthday, 'id' | 'createdAt' | 'userId'>>({
    fullName: '',
    birthDate: '',
    category: 'Amigo',
    phone: '',
    email: '',
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const existing = birthdays.find(b => b.id === id);
      if (existing) {
        setFormData({
          fullName: existing.fullName,
          birthDate: existing.birthDate,
          category: existing.category,
          phone: existing.phone || '',
          email: existing.email || '',
          observations: existing.observations || ''
        });
      }
    }
  }, [id, birthdays]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';

    const birthYear = new Date(formData.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (birthYear > currentYear) newErrors.birthDate = 'Data inválida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (id) {
      updateBirthday(id, formData);
    } else {
      addBirthday(formData);
    }
    navigate('/list');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const inputClasses = (error?: string) => `
    w-full px-4 py-3 bg-white border rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 
    transition-all placeholder:text-slate-400 text-slate-900 font-medium
    ${error ? 'border-red-500 bg-red-50/30' : 'border-slate-300'}
  `;

  const labelClasses = "block text-sm font-bold text-slate-900 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 px-2">
        <Link to="/list" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-500 shadow-sm active:scale-95">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {id ? 'Editar' : 'Novo Cadastro'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] md:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 md:p-10 space-y-10">
          {/* Section: Basic Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Nome Completo *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className={inputClasses(errors.fullName)}
                />
                {errors.fullName && <p className="text-xs text-red-600 flex items-center gap-1.5 font-bold mt-1.5"><AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Data de Nascimento *</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className={inputClasses(errors.birthDate)}
                />
                {errors.birthDate && <p className="text-xs text-red-600 flex items-center gap-1.5 font-bold mt-1.5"><AlertCircle className="h-3.5 w-3.5" /> {errors.birthDate}</p>}
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Categoria</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    className={`${inputClasses()} appearance-none`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronLeft className="h-4 w-4 -rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
              Contato (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className={inputClasses()}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className={inputClasses()}
                />
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="space-y-2">
            <label className={labelClasses}>Observações</label>
            <textarea
              rows={4}
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Notas sobre preferências, ideias de presentes, etc..."
              className={`${inputClasses()} resize-none`}
            />
          </div>
        </div>

        <div className="bg-slate-50/50 px-6 md:px-10 py-8 md:py-8 flex flex-col md:flex-row gap-5 items-center justify-between border-t border-slate-100">
          <p className="hidden md:block text-xs text-slate-500 font-bold uppercase tracking-widest text-center md:text-left">* Campos obrigatórios</p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/list')}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              <Save className="h-5 w-5" />
              {id ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
          <p className="md:hidden text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center">* Campos obrigatórios</p>
        </div>
      </form>
    </div>
  );
};

export default BirthdayForm;

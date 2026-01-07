
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
      <div className="flex items-center gap-4">
        <Link to="/list" className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">
          {id ? 'Editar Aniversariante' : 'Novo Aniversariante'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Section: Basic Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Informações Básicas</h3>
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
                {errors.fullName && <p className="text-xs text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="h-3 w-3" /> {errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Data de Nascimento *</label>
                <input 
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className={inputClasses(errors.birthDate)}
                />
                {errors.birthDate && <p className="text-xs text-red-600 flex items-center gap-1 font-semibold"><AlertCircle className="h-3 w-3" /> {errors.birthDate}</p>}
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Categoria</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                  className={inputClasses()}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Contato (Opcional)</h3>
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
              className={inputClasses()}
            />
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-6 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-200">
          <p className="text-xs text-slate-600 font-medium">* Campos obrigatórios</p>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/list')}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 hover:border-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Save className="h-4 w-4" />
              {id ? 'Salvar Alterações' : 'Salvar Cadastro'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BirthdayForm;

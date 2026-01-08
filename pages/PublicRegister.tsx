
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBirthdays } from '../context/BirthdayContext';
import { formatPhone } from '../utils';
import { Category, Birthday } from '../types';
import { Save, AlertCircle, CheckCircle2, Calendar, User, Phone, Mail, ChevronLeft } from 'lucide-react';

const PublicRegister: React.FC = () => {
    const { ownerId } = useParams<{ ownerId: string }>();
    const { publicAddBirthday } = useBirthdays();

    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        category: 'Outros' as Category,
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let formatted = value;
        if (value.length > 2) formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
        if (value.length > 4) formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;

        setFormData({ ...formData, birthDate: formatted });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
        if (!formData.birthDate) {
            newErrors.birthDate = 'Data de nascimento é obrigatória';
        } else if (formData.birthDate.length < 10) {
            newErrors.birthDate = 'Data incompleta (DD/MM/AAAA)';
        } else {
            const [d, m, y] = formData.birthDate.split('/').map(Number);
            const date = new Date(y, m - 1, d);
            if (isNaN(date.getTime()) || date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
                newErrors.birthDate = 'Data inválida';
            } else if (y > new Date().getFullYear()) {
                newErrors.birthDate = 'Ano inválido';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !ownerId) return;

        setStatus('loading');
        setErrorMessage('');
        try {
            // Convert DD/MM/YYYY to YYYY-MM-DD for storage
            const [d, m, y] = formData.birthDate.split('/');
            const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

            await publicAddBirthday(ownerId, {
                fullName: formData.fullName,
                birthDate: isoDate,
                email: formData.email,
                phone: formData.phone,
                category: formData.category,
                observations: 'Cadastrado via link público',
            });
            setStatus('success');
            setFormData({
                fullName: '',
                birthDate: '',
                email: '',
                phone: '',
                category: 'Outros',
            });
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            if (error.code === 'permission-denied') {
                setErrorMessage('Erro de permissão: O sistema ainda não está configurado para aceitar cadastros públicos externos no banco de dados.');
            } else {
                setErrorMessage('Ocorreu um erro ao salvar. Tente novamente mais tarde.');
            }
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sucesso!</h2>
                        <p className="text-slate-500 font-medium">Seu aniversário foi cadastrado com sucesso. Obrigado por compartilhar!</p>
                    </div>
                    <button
                        onClick={() => setStatus('idle')}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        Cadastrar outro
                    </button>
                </div>
            </div>
        );
    }

    const inputClasses = (hasError?: string) => `
    w-full px-5 py-4 bg-slate-50 border transition-all duration-200 outline-none font-medium text-slate-700
    ${hasError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
    rounded-2xl
  `;

    const labelClasses = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Calendar className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">BdayHub</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Deixe sua data! 🎂</h1>
                    <p className="text-slate-500 font-medium px-4">Cadastre seu aniversário para que possamos celebrar juntos.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-10 space-y-6">
                        <div className="space-y-2">
                            <label className={labelClasses}>Nome Completo *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    className={`${inputClasses(errors.fullName)} pl-12`}
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-600 flex items-center gap-1.5 font-bold mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Data de Nascimento *</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="DD/MM/AAAA"
                                    className={`${inputClasses(errors.birthDate)} pl-12`}
                                    value={formData.birthDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                            {errors.birthDate && <p className="text-xs text-red-600 flex items-center gap-1.5 font-bold mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.birthDate}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={labelClasses}>Email (Opcional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className={`${inputClasses()} pl-12`}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>Telefone (Opcional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                    <input
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        className={`${inputClasses()} pl-12`}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </span>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Enviar Cadastro
                                </>
                            )}
                        </button>

                        {status === 'error' && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2 animate-shake">
                                <p className="text-xs text-red-600 text-center font-bold">
                                    {errorMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protegido por BdayHub</p>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/login" className="text-sm text-slate-400 hover:text-indigo-600 font-bold transition-colors">
                        É o dono da conta? Entre aqui
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicRegister;

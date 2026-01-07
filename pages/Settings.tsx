
import React from 'react';
import { useBirthdays } from '../context/BirthdayContext';
import { Bell, Clock, CalendarDays, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useBirthdays();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
        <p className="text-slate-500">Ajuste como o BdayHub deve te notificar sobre as datas.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden divide-y">
        {/* Notifications Toggle */}
        <div className="p-8 flex items-start justify-between gap-6">
          <div className="flex gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl h-fit">
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Notificações Internas</h4>
              <p className="text-sm text-slate-500 mt-1">
                Ative ou desative todos os alertas de aniversários dentro do sistema.
              </p>
            </div>
          </div>
          <button 
            onClick={() => updateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Lead Time */}
        <div className="p-8 flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl h-fit">
            <CalendarDays className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800">Antecedência do Lembrete</h4>
              <p className="text-sm text-slate-500 mt-1">
                Quantos dias antes do aniversário você deseja ser avisado?
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 3, 7, 15, 30].map(days => (
                <button
                  key={days}
                  onClick={() => updateSettings({ ...settings, notificationDays: days })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    settings.notificationDays === days 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {days} {days === 1 ? 'dia' : 'dias'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Time */}
        <div className="p-8 flex items-start gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl h-fit">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800">Horário Padrão</h4>
              <p className="text-sm text-slate-500 mt-1">
                Defina o horário em que novas notificações do dia devem aparecer.
              </p>
            </div>
            <input 
              type="time" 
              value={settings.notificationTime}
              onChange={e => updateSettings({ ...settings, notificationTime: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Security / Account Info */}
        <div className="p-8 flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl h-fit">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">Conta e Segurança</h4>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Gerencie sua senha e sessões ativas.
            </p>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Alterar senha de acesso →</button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">BdayHub v1.0.0 - Versão Estável</p>
      </div>
    </div>
  );
};

export default Settings;

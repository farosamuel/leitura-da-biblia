
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER, MOCK_READING, IMAGES } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Bom dia, {MOCK_USER.name}!</h1>
        <p className="text-slate-500">Hoje é dia de avançar no conhecimento. Vamos para a leitura de hoje?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 overflow-hidden">
            <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_today</span>
                Leitura de Hoje
              </h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Dia 288/365</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Salmos 119:1-88</h4>
                  <p className="text-slate-500 font-medium">Tempo estimado: 15 min</p>
                </div>
                <button 
                  onClick={() => navigate('/reading')}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center gap-2 w-full md:w-auto justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Marcar como Lido
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800">
                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">sticky_note_2</span>
                  Notas Rápidas
                </h5>
                <textarea 
                  className="w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  placeholder="Escreva o que Deus falou com você hoje..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-900 dark:text-white text-xl">Progresso da Semana</h3>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Leituras Concluídas</span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-4 px-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full bg-primary-light dark:bg-primary/10 rounded-t-xl h-full relative overflow-hidden">
                    <div 
                      className={`absolute bottom-0 w-full bg-primary rounded-t-xl transition-all duration-700 ${idx < 3 ? 'h-full' : 'h-0'}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-8">Progresso Anual</h3>
            <div className="flex justify-center mb-8">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="text-slate-100 dark:text-zinc-800 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
                  <circle className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">76%</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Concluído</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Lidos</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">288</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Restantes</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">77</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Top Leitores</h3>
              <button className="text-xs font-black text-primary hover:underline">VER TODOS</button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Ana Maria', days: 290, color: 'bg-yellow-100 text-yellow-700', icon: 'emoji_events' },
                { name: 'Carlos Silva', days: 289, color: 'bg-slate-100 text-slate-700', icon: 'looks_two' },
                { name: 'Paulo Roberto', days: 288, color: 'bg-orange-100 text-orange-700', icon: 'looks_3' }
              ].map((reader, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${reader.color}`}>
                      {reader.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{reader.name}</p>
                      <p className="text-xs text-slate-500">{reader.days} dias</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined ${idx === 0 ? 'text-yellow-500' : 'text-slate-300'}`}>{reader.icon}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-red-200 dark:shadow-none">
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[160px] text-white opacity-10">auto_stories</span>
            <h3 className="font-black text-xl mb-4 relative z-10">Próximos Livros</h3>
            <ul className="space-y-3 relative z-10">
              {['Provérbios', 'Eclesiastes', 'Cantares'].map((book, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className={`size-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/40'}`} />
                  <span className={`text-sm font-bold ${idx === 0 ? 'opacity-100' : 'opacity-70'}`}>{book}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

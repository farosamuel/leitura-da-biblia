
import React from 'react';
import { IMAGES } from '../../constants';

const AdminParticipants: React.FC = () => {
  const participants = [
    { name: 'Lucas Ferreira', email: 'lucas.f@email.com', book: 'O Senhor dos Anéis', progress: 75, status: 'Em dia', avatar: IMAGES.FRIEND_1 },
    { name: 'Sofia Martins', email: 'sofia.m@email.com', book: '1984', progress: 42, status: 'Atenção', avatar: IMAGES.FRIEND_2 },
    { name: 'Pedro Santos', email: 'pedro.s@email.com', book: 'Dom Casmurro', progress: 15, status: 'Atrasado', avatar: IMAGES.FRIEND_3 },
    { name: 'Maria Gonzalez', email: 'maria.g@email.com', book: 'Gênesis', progress: 98, status: 'Em dia', avatar: IMAGES.FRIEND_1 },
    { name: 'Carlos Mendes', email: 'carlos.m@email.com', book: 'Gênesis', progress: 95, status: 'Em dia', avatar: IMAGES.FRIEND_2 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Participantes</h1>
          <p className="text-slate-500 mt-1">Gerencie os membros e acompanhe o progresso individual.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
            <input className="pl-10 pr-4 py-2 border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl text-sm w-64 focus:ring-primary" placeholder="Buscar..." />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95">
            <span className="material-symbols-outlined">person_add</span>
            Novo Participante
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Membros', val: '152', color: 'text-primary', icon: 'group' },
          { label: 'Membros Ativos', val: '142', color: 'text-green-600', icon: 'check_circle' },
          { label: 'Com Atraso', val: '8', color: 'text-orange-600', icon: 'warning' },
          { label: 'Concluídos', val: '12', color: 'text-blue-600', icon: 'emoji_events' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm group">
            <div className="flex items-center justify-between mb-4">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
               <span className={`material-symbols-outlined ${s.color} opacity-20 group-hover:opacity-100 transition-opacity`}>{s.icon}</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{s.val}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex justify-between items-center">
          <h3 className="font-bold text-lg">Lista de Participantes</h3>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold border rounded-lg hover:bg-white transition-colors">
               <span className="material-symbols-outlined text-sm">filter_list</span> Filtrar
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold border rounded-lg hover:bg-white transition-colors">
               <span className="material-symbols-outlined text-sm">download</span> Exportar
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-800/10 border-b border-slate-100 dark:border-zinc-800">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Participante</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Leitura Atual</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Progresso Geral</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {participants.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} className="size-10 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm" alt="U" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold">{p.book}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Capítulo Atual</p>
                  </td>
                  <td className="py-4 px-6 min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      p.status === 'Em dia' ? 'bg-green-50 text-green-700 border-green-100' :
                      p.status === 'Atenção' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      <span className={`size-1.5 rounded-full ${p.status === 'Em dia' ? 'bg-green-500' : p.status === 'Atenção' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mostrando 5 de 152</p>
           <div className="flex gap-1">
              <button className="px-3 py-1 text-xs font-bold border rounded hover:bg-white disabled:opacity-50" disabled>Anterior</button>
              <button className="px-3 py-1 text-xs font-bold border rounded hover:bg-white">Próximo</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminParticipants;

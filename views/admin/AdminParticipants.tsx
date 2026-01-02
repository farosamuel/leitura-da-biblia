import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../constants';
import { supabase } from '../../services/supabaseClient';

const AdminParticipants: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMember, setSuccessMember] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    if (data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Call the Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('create-member', {
        body: newMember
      });

      if (functionError) {
        throw functionError;
      }

      setSuccessMember(newMember.name);
      setNewMember({ name: '', email: '', password: '' });
      fetchProfiles();
    } catch (err: any) {
      console.error('Erro detalhado:', err);
      let displayMessage = err.message || 'Erro desconhecido';

      // Advanced error extraction for Supabase Edge Functions
      if (err.context && typeof err.context.json === 'function') {
        try {
          // Clone the response if needed, but context is usually direct
          const body = await err.context.json();
          displayMessage = body.error || body.message || displayMessage;
        } catch (e) {
          try {
            const bodyText = await err.context.text();
            if (bodyText) displayMessage = bodyText;
          } catch (e2) { }
        }
      }

      alert('Erro ao criar membro: ' + displayMessage);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div>
          <h1 className="text-[40px] font-black text-slate-900 dark:text-white leading-tight tracking-tight">Participantes</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight mt-1">Gerencie os membros e acompanhe o progresso individual.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative group">
            <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input className="pl-12 pr-6 py-3 border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-[20px] text-sm w-80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium" placeholder="Buscar por nome ou email..." />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-[20px] font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined !text-[20px]">person_add</span>
            NOVO MEMBRO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Membros', val: profiles.length.toString(), color: 'text-primary', bg: 'bg-primary/5', icon: 'groups' },
          { label: 'Membros Ativos', val: profiles.length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-500/5', icon: 'check_circle' },
          { label: 'Com Atraso', val: '0', color: 'text-orange-600', bg: 'bg-orange-500/5', icon: 'warning' },
          { label: 'Concluídos', val: '0', color: 'text-indigo-600', bg: 'bg-indigo-500/5', icon: 'emoji_events' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-premium group hover:border-primary/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${s.bg} border border-transparent group-hover:border-current/10 transition-all`}>
                <span className={`material-symbols-outlined ${s.color} !text-[24px] fill-1`}>{s.icon}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label.split(' ')[0]}</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{s.val}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{s.label}</p>
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando membros...</td>
                </tr>
              ) : profiles.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} className="size-10 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm" alt="U" />
                      ) : (
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs uppercase">{p.name[0]}</div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold">Gênesis</p>
                    <p className="text-[10px] text-slate-400 font-bold">Capítulo 1</p>
                  </td>
                  <td className="py-4 px-6 min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black">0%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `0%` }} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-green-50 text-green-700 border-green-100`}>
                      <span className={`size-1.5 rounded-full bg-green-500`} />
                      Em dia
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

      {/* Modal Novo Membro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl w-full max-w-lg p-10 space-y-8 animate-in zoom-in-95 duration-300 border border-white/20">
            {successMember ? (
              // Success State
              <div className="text-center space-y-6 py-4">
                <div className="mx-auto size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 !text-[40px] fill-1">check_circle</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Membro Criado!</h2>
                  <p className="text-slate-500 font-medium">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{successMember}</span> foi adicionado(a) com sucesso.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setSuccessMember(null); }}
                    className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    Adicionar Outro
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(false); setSuccessMember(null); }}
                    className="flex-1 bg-primary hover:bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 transition-all"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              // Form State
              <>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight">Novo Membro</h2>
                    <p className="text-slate-500 font-medium">Cadastre um novo leitor na célula.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateMember} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-medium"
                      placeholder="Nome do leitor"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
                    <input
                      required
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-medium"
                      placeholder="leitor@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Senha Inicial</label>
                    <input
                      required
                      type="password"
                      value={newMember.password}
                      onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-medium"
                      placeholder="••••••••"
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 italic">Informe esta senha ao membro para o primeiro acesso.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                    ) : (
                      'CRIAR MEMBRO'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParticipants;

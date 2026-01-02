
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';
import { MOCK_READING } from '../constants';

const ReadingView: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const handleAIInsight = async () => {
    setLoadingInsight(true);
    const result = await gemini.getReadingInsight(MOCK_READING.passage, MOCK_READING.theme);
    setInsight(result || "Insight indisponível.");
    setLoadingInsight(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Home</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-400">Plano</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-primary">Dia {MOCK_READING.day}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="size-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-slate-600">Dia {MOCK_READING.day} de 365</span>
          <button className="size-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </nav>

      <div className="space-y-4">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">{MOCK_READING.category}</span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">Antigo Testamento</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">{MOCK_READING.date}</h1>
        <p className="text-xl font-bold text-primary">Tema: {MOCK_READING.theme}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 rounded-full pointer-events-none" />
             <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Leitura de Hoje</span>
                  <h2 className="text-3xl font-black text-slate-900">{MOCK_READING.passage}</h2>
                </div>
                <div className="flex gap-2">
                  <select className="bg-slate-50 border-slate-200 rounded-xl text-xs font-bold py-2 px-3 focus:ring-primary">
                    <option>NVI (Versão Internacional)</option>
                    <option>Almeida Revista</option>
                  </select>
                  <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
                    <span className="material-symbols-outlined">volume_up</span>
                  </button>
                </div>
             </div>

             <article className="prose prose-slate prose-lg max-w-none">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 border-l-4 border-primary pl-4">{MOCK_READING.book} 1</h3>
                  <div className="text-slate-700 leading-relaxed text-lg font-medium space-y-4">
                    {MOCK_READING.content.map((v, i) => (
                      <p key={i}><span className="text-primary font-black mr-2">{i+1}</span> {v}</p>
                    ))}
                  </div>
                </div>
             </article>

             <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                <button 
                  onClick={handleAIInsight}
                  disabled={loadingInsight}
                  className="bg-zinc-950 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{loadingInsight ? 'refresh' : 'psychology'}</span>
                  {loadingInsight ? 'Processando Insight...' : 'Gerar Insight com IA'}
                </button>

                {insight && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 italic text-sm leading-relaxed animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 mb-2 not-italic font-black text-primary uppercase tracking-widest text-xs">
                       <span className="material-symbols-outlined text-sm">auto_awesome</span>
                       IA Insight
                    </div>
                    {insight}
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  Anotações Pessoais
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salvo Automaticamente</span>
             </div>
             <textarea 
               className="w-full bg-slate-50 border-none rounded-2xl p-6 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary min-h-[150px] resize-none"
               placeholder="O que você aprendeu com a leitura de hoje?"
             />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progresso do Dia</span>
                <span className="text-sm font-black text-primary">0%</span>
              </div>
              <button className="bg-primary hover:bg-primary-dark text-white w-full py-5 rounded-2xl font-black text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-3 transition-all active:scale-95">
                <span className="material-symbols-outlined">check_circle</span>
                Concluir Leitura
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase leading-relaxed">
                Ao concluir, seu progresso será sincronizado com o grupo.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Material de Apoio</h4>
              <div className="space-y-3">
                <a href="#" className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Vídeo: Gênesis 1-11</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">The Bible Project • 7 min</p>
                  </div>
                </a>
                <a href="#" className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined">article</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Artigo: A Criação</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Teologia • 5 min leitura</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReadingView;

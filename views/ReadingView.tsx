import React, { useState, useEffect } from 'react';
import { readingPlanService, ReadingPlanDay } from '../services/readingPlanService';
import { bibleService } from '../services/bibleService';
import { supabase } from '../services/supabaseClient';
import { gemini } from '../services/geminiService';

const ReadingView: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(readingPlanService.getCurrentDay());
  const [dayData, setDayData] = useState<ReadingPlanDay | undefined>(readingPlanService.getPlanForDay(readingPlanService.getCurrentDay()));
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRead, setIsRead] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const loadDayData = async (day: number, userSession: any) => {
    setLoading(true);
    const data = readingPlanService.getPlanForDay(day);
    setDayData(data);

    if (data) {
      try {
        const { bookAbbrev, chapter } = bibleService.parsePassage(data.passage);
        const versesData = await bibleService.getChapterVerses(bookAbbrev, chapter);
        setVerses(versesData);
      } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        setVerses([]);
      }

      // Carregar progresso e anotações se usuário estiver logado
      if (userSession?.user) {
        const { data: progressData } = await supabase
          .from('reading_progress')
          .select('is_read, notes')
          .eq('day_number', day)
          .eq('user_id', userSession.user.id)
          .maybeSingle();

        setIsRead(!!progressData?.is_read);
        setPersonalNotes(progressData?.notes || '');
      } else {
        setPersonalNotes('');
      }
    }
    setLoading(false);
  };

  // Debounce para salvar anotações automaticamente
  useEffect(() => {
    if (!session?.user || !personalNotes.trim()) return;

    const timeoutId = setTimeout(async () => {
      setSavingNotes(true);
      try {
        const { error } = await supabase
          .from('reading_progress')
          .upsert({
            user_id: session.user.id,
            day_number: currentDay,
            notes: personalNotes.trim(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,day_number' });

        if (error) {
          console.error('Erro ao salvar anotações:', error);
        }
      } catch (error) {
        console.error('Erro ao salvar anotações:', error);
      } finally {
        setSavingNotes(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [personalNotes, session, currentDay]);

  useEffect(() => {
    if (session) {
      loadDayData(currentDay, session);
    } else {
      // Carregar dados básicos mesmo sem login
      const data = readingPlanService.getPlanForDay(currentDay);
      setDayData(data);
      if (data) {
        bibleService.getChapterVerses(
          bibleService.parsePassage(data.passage).bookAbbrev,
          bibleService.parsePassage(data.passage).chapter
        ).then(setVerses).catch(() => setVerses([]));
      }
      setLoading(false);
    }
  }, [currentDay, session]);

  const navigateDay = (direction: 'next' | 'prev') => {
    const total = readingPlanService.getTotalDays();
    if (direction === 'next' && currentDay < total) {
      setCurrentDay(prev => prev + 1);
    } else if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(prev => prev - 1);
    }
  };

  const toggleRead = async () => {
    if (!session?.user) return;
    const newState = !isRead;
    setIsRead(newState);

    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: session.user.id,
          day_number: currentDay,
          is_read: newState,
          read_at: new Date().toISOString()
        }, { onConflict: 'user_id,day_number' });

      if (error) {
        console.error('Erro ao salvar progresso:', error);
        setIsRead(!newState);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      setIsRead(!newState);
    }
  };

  const handleAIInsight = async () => {
    if (!dayData) return;
    setLoadingInsight(true);
    try {
      const result = await gemini.getReadingInsight(dayData.passage, dayData.theme);
      setInsight(result || "Insight indisponível no momento.");
    } catch (error) {
      console.error('Erro ao gerar insight:', error);
      setInsight("Não foi possível gerar o insight. Tente novamente.");
    } finally {
      setLoadingInsight(false);
    }
  };

  if (!dayData && !loading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-premium">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Plano não encontrado</h2>
        <button onClick={() => setCurrentDay(1)} className="text-primary font-bold underline">Voltar para o Dia 1</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Home</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-400">Plano Anual</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-primary">Dia {currentDay}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDay('prev')}
            disabled={currentDay <= 1}
            className="size-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <span className="material-symbols-outlined pointer-events-none">chevron_left</span>
          </button>
          <span className="text-sm font-black text-slate-700 tracking-tight">DIA {currentDay} DE {readingPlanService.getTotalDays()}</span>
          <button
            onClick={() => navigateDay('next')}
            disabled={currentDay >= readingPlanService.getTotalDays()}
            className="size-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <span className="material-symbols-outlined pointer-events-none">chevron_right</span>
          </button>
        </div>
      </nav>

      <div className="space-y-4">
        <div className="flex gap-2">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            {dayData?.category}
          </span>
          <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
            Leitura Diária
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
          {dayData?.passage}
        </h1>
        <p className="text-2xl font-bold text-primary tracking-tight">Tema: {dayData?.theme}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Leitura de Hoje</span>
                <h2 className="text-3xl font-black text-slate-900">{dayData?.passage}</h2>
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

            <article className="prose prose-slate prose-lg max-w-none min-h-[400px]">
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 border-l-4 border-primary pl-4">
                  {dayData?.book} {dayData?.passage.split(' ')[1]}
                </h3>

                {loading ? (
                  <div className="space-y-4 animate-pulse pt-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                  </div>
                ) : verses.length > 0 ? (
                  <div className="text-slate-700 leading-relaxed text-lg font-medium space-y-4">
                    {verses.map((verse, i) => (
                      <p key={i}>
                        <span className="text-primary font-black mr-2 text-sm">{i + 1}</span>
                        {verse}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl text-center">
                    <p className="text-slate-500 font-bold">Conteúdo não disponível para esta versão.</p>
                    <p className="text-[10px] uppercase font-black text-slate-400 mt-2">Tente novamente em instantes</p>
                  </div>
                )}
              </div>
            </article>

            <div className="mt-12 pt-8 border-t border-slate-100 space-y-8">
              {/* Botão de marcar leitura como concluída */}
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={toggleRead}
                  disabled={!session?.user}
                  className={`w-full max-w-md py-5 rounded-[20px] font-black text-base shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isRead
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 text-white'
                      : 'bg-primary hover:bg-primary-600 shadow-primary/30 text-white'
                  } ${!session?.user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined transition-all !text-[20px]">
                    {isRead ? 'check_circle' : 'task_alt'}
                  </span>
                  {isRead ? 'Leitura Concluída ✓' : 'Marcar como Lido'}
                </button>

                {!session?.user && (
                  <p className="text-sm text-slate-500 text-center">
                    Faça login para salvar seu progresso de leitura
                  </p>
                )}
              </div>

              {/* Botão de gerar insight com IA */}
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleAIInsight}
                  disabled={loadingInsight || !session?.user}
                  className="bg-zinc-950 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{loadingInsight ? 'refresh' : 'psychology'}</span>
                  {loadingInsight ? 'Processando Insight...' : 'Gerar Insight com IA'}
                </button>

                {!session?.user && (
                  <p className="text-sm text-slate-500 text-center">
                    Faça login para usar a funcionalidade de IA
                  </p>
                )}

                {insight && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 italic text-sm leading-relaxed animate-in zoom-in duration-300 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4 not-italic font-black text-primary uppercase tracking-widest text-xs">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      IA Insight
                    </div>
                    {insight}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Anotações */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Anotações Pessoais
              </h3>
              <div className="flex items-center gap-2">
                {savingNotes && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400">Salvando...</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {savingNotes ? '' : 'Salvo Automaticamente'}
                </span>
              </div>
            </div>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              disabled={!session?.user}
              className="w-full bg-slate-50 border-none rounded-2xl p-6 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary min-h-[150px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={session?.user ? "O que você aprendeu com a leitura de hoje?" : "Faça login para fazer anotações pessoais"}
            />
            {!session?.user && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                Suas anotações são salvas automaticamente e ficam privadas
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Status da Leitura */}
            <div className="bg-white rounded-[32px] p-6 shadow-premium border border-slate-100 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado da Leitura</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${isRead ? 'text-emerald-600 bg-emerald-50' : 'text-primary bg-primary/10'}`}>
                  {isRead ? 'CONCLUÍDO' : 'PENDENTE'}
                </span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-dotted border-slate-200">
                <p className="text-[11px] text-center text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                  {isRead
                    ? "Parabéns! Seu progresso foi atualizado com sucesso hoje."
                    : "Ao concluir, seu objetivo diário será atingido."}
                </p>
              </div>
            </div>

            {/* Estatísticas de Progresso */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Seu Progresso</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Dias Lidos</span>
                  <span className="text-sm font-black text-primary">{isRead ? '1' : '0'} / 1</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: isRead ? '100%' : '0%' }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Dia {currentDay} de {readingPlanService.getTotalDays()}
                </p>
              </div>
            </div>

            {/* Material de Apoio */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Material de Apoio</h4>
              <div className="space-y-3">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(dayData?.theme || '')} bíblia estudo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Vídeos sobre "{dayData?.theme}"</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">YouTube • Estudos relacionados</p>
                  </div>
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(dayData?.theme || '')} significado bíblico estudo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Pesquisar significado</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Google • Estudos bíblicos</p>
                  </div>
                </a>
                <a
                  href={`https://biblehub.com/commentaries/${(dayData?.passage || '').toLowerCase().replace(/\s+/g, '_')}.htm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">library_books</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Comentários bíblicos</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">BibleHub • Interpretações</p>
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
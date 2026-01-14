import React, { useState, useEffect } from 'react';
import { readingPlanService, ReadingPlanDay } from '../services/readingPlanService';
import { bibleService } from '../services/bibleService';

const ReadingView: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(readingPlanService.getCurrentDay());
  const [dayData, setDayData] = useState<ReadingPlanDay | undefined>(readingPlanService.getPlanForDay(readingPlanService.getCurrentDay()));
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDayData = async () => {
      setLoading(true);
      const data = readingPlanService.getPlanForDay(currentDay);
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
      }
      setLoading(false);
    };

    loadDayData();
  }, [currentDay]);

  const navigateDay = (direction: 'next' | 'prev') => {
    const total = readingPlanService.getTotalDays();
    if (direction === 'next' && currentDay < total) {
      setCurrentDay(prev => prev + 1);
    } else if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(prev => prev - 1);
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 p-8">
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

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 rounded-full pointer-events-none" />
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Leitura de Hoje</span>
            <h2 className="text-3xl font-black text-slate-900">{dayData?.passage}</h2>
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
      </div>
    </div>
  );
};

export default ReadingView;

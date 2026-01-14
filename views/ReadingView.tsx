import React, { useState, useEffect } from 'react';
import { readingPlanService, ReadingPlanDay } from '../services/readingPlanService';

const ReadingView: React.FC = () => {
  const [currentDay] = useState(readingPlanService.getCurrentDay());
  const [dayData] = useState<ReadingPlanDay | undefined>(readingPlanService.getPlanForDay(readingPlanService.getCurrentDay()));

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Teste - Reading View</h1>
        <p className="text-xl text-slate-600 mb-8">Dia {currentDay}</p>

        {dayData ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">{dayData.passage}</h2>
            <p className="text-lg text-slate-700 mb-4">Tema: {dayData.theme}</p>
            <p className="text-sm text-slate-500">Categoria: {dayData.category}</p>
            <p className="text-sm text-slate-500">Livro: {dayData.book}</p>
          </div>
        ) : (
          <p className="text-slate-500">Dados do plano não encontrados</p>
        )}
      </div>
    </div>
  );
};

export default ReadingView;
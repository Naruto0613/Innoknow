import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Info, AlertCircle, Sparkles } from 'lucide-react';

interface GrammarLessonProps {
  title: string;
  explanation: string;
  formula: string;
  examples: {
    positive: string;
    negative: string;
    question: string;
  };
  commonMistakes?: string[];
}

export default function GrammarLesson({ title, explanation, formula, examples, commonMistakes }: GrammarLessonProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-sm space-y-8 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#58007E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#58007E]/20">
              <BookOpen size={24} />
            </div>
            <h2 className="text-3xl font-black italic font-serif tracking-tight">{title}</h2>
          </div>
          <p className="text-zinc-500 font-medium leading-loose italic max-w-2xl">"{explanation}"</p>
        </div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-zinc-50 rounded-full blur-3xl group-hover:bg-[#58007E]/5 transition-colors"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#141414] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 flex items-center gap-2">
               <Sparkles size={14} className="text-amber-400" /> Structure Invariant
            </h3>
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 mb-8">
              <p className="text-2xl font-black italic tracking-tight text-white">{formula}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                <p className="text-sm font-medium text-zinc-300 italic"><span className="text-[10px] font-black uppercase text-zinc-500 mr-2">Pos:</span> {examples.positive}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                <p className="text-sm font-medium text-zinc-300 italic"><span className="text-[10px] font-black uppercase text-zinc-500 mr-2">Neg:</span> {examples.negative}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                <p className="text-sm font-medium text-zinc-300 italic"><span className="text-[10px] font-black uppercase text-zinc-500 mr-2">Que:</span> {examples.question}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {commonMistakes && commonMistakes.length > 0 && (
          <div className="bg-white border border-zinc-100 p-10 rounded-[48px] shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-red-500 mb-8 flex items-center gap-2">
               <AlertCircle size={18} /> Usage Guardrails
            </h3>
            <div className="space-y-4">
              {commonMistakes.map((mistake, i) => (
                <div key={i} className="p-5 bg-red-50/50 rounded-3xl border border-red-50 flex items-start gap-4">
                  <X className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-xs font-bold text-zinc-700 italic leading-relaxed">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const X = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

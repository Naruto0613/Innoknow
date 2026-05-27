import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Brain, ArrowRight, ClipboardCheck } from 'lucide-react';
import { getAIFeedback } from '../utils/ai';
import { useAuth } from '../hooks/useAuth';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const levelQuestions: Question[] = [
  {
    id: 1,
    text: "I ___ to school every day.",
    options: ["go", "goes", "went", "going"],
    correct: 0
  },
  {
    id: 2,
    text: "She ___ reading books in her free time.",
    options: ["don't like", "doesn't likes", "doesn't like", "not like"],
    correct: 2
  },
  {
    id: 3,
    text: "I have been living here ___ 2010.",
    options: ["for", "since", "until", "by"],
    correct: 1
  },
  {
    id: 4,
    text: "If I ___ you, I would take the job.",
    options: ["was", "were", "am", "be"],
    correct: 1
  },
  {
    id: 5,
    text: "By the time he arrived, the meeting ___.",
    options: ["already started", "had already started", "has already started", "was already starting"],
    correct: 1
  }
];

export default function LevelTest() {
  const { updateProfile, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [levelResult, setLevelResult] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAnswer = (questionId: number, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    levelQuestions.forEach(q => {
      if (answers[q.id] === q.correct) score++;
    });
    return score;
  };

  const determineLevel = (score: number) => {
    if (score <= 1) return 'A1';
    if (score === 2) return 'A2';
    if (score === 3) return 'B1';
    if (score === 4) return 'B2';
    return 'C1';
  };

  const finishTest = async () => {
    setIsAnalyzing(true);
    setCurrentStep('result');
    const score = calculateScore();
    const finalLevel = determineLevel(score);
    setLevelResult(finalLevel);

    if (user) {
      try {
        await updateProfile({ level: finalLevel });
      } catch (err) {
        console.error("Failed to update profile level from test:", err);
      }
    }

    const prompt = `Student took a 5-question level test and scored ${score}/5. The determined level is ${finalLevel}. 
    Questions answered correctly: ${score}.
    Provide a brief analysis of their performance and what they should focus on next for their level. 
    Keep it encouraging and helpful.`;
    
    const analysis = await getAIFeedback(prompt, "Level Test Analysis", finalLevel);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {currentStep === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[48px] border border-zinc-100 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-[#58007E]/10 text-[#58007E] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ClipboardCheck size={40} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">English Proficiency Test</h1>
            <p className="text-zinc-500 mb-10 leading-relaxed max-w-sm mx-auto">
              Find out your current English level (CEFR) in just a few minutes. 
              Our AI will analyze your results and provide a study plan.
            </p>
            <button 
              onClick={() => setCurrentStep('test')}
              className="bg-[#58007E] text-white w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#40005C] transition-all flex items-center justify-center gap-2"
            >
              Start Level Test <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {currentStep === 'test' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-xs font-black uppercase tracking-widest text-[#58007E]">Proficiency Assessment</h2>
               <span className="text-[10px] font-bold text-zinc-400">5 Questions Total</span>
            </div>
            <div className="space-y-6">
              {levelQuestions.map((q, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={q.id} 
                  className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm"
                >
                  <p className="text-lg font-bold text-zinc-900 mb-6">{q.id}. {q.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswer(q.id, optIdx)}
                        className={`p-4 rounded-xl text-sm font-medium text-left border-2 transition-all ${answers[q.id] === optIdx ? 'bg-[#58007E] border-[#58007E] text-white shadow-lg' : 'bg-zinc-50 border-transparent text-zinc-600 hover:border-zinc-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <button 
              onClick={finishTest}
              disabled={Object.keys(answers).length < 5}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${Object.keys(answers).length === 5 ? 'bg-[#58007E] text-white hover:bg-[#40005C] shadow-xl' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
            >
              Analyze Results
            </button>
          </div>
        )}

        {currentStep === 'result' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-[#58007E] p-12 rounded-[48px] text-white text-center shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Trophy size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Your English Level is</p>
                  <h2 className="text-8xl font-black italic mb-4">{levelResult}</h2>
                  <p className="text-indigo-100 font-medium">Excellent work completing the assessment!</p>
               </div>
               <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="text-amber-500" size={24} />
                  <h3 className="text-xl font-bold">AI Performance Analysis</h3>
               </div>
               <div className="bg-zinc-50 p-8 rounded-3xl leading-relaxed">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-[#58007E] border-t-transparent rounded-full" />
                      <span className="text-sm italic">AI Coach is thinking...</span>
                    </div>
                  ) : (
                    <p className="text-zinc-700 whitespace-pre-wrap">{aiAnalysis}</p>
                  )}
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCurrentStep('intro')} className="flex-1 py-5 rounded-2xl border-2 border-zinc-100 font-black text-xs uppercase tracking-widest hover:border-zinc-300 transition-all">Retake Test</button>
              <button 
                onClick={() => window.location.href = '/courses'} 
                className="flex-[2] bg-[#58007E] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#40005C] transition-all shadow-xl"
              >
                Go to Recommended Courses
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

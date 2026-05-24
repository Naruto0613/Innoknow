import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';

interface WritingEditorProps {
  topic: string;
  minWords: number;
  onCheck: (text: string) => Promise<string>;
}

export default function WritingEditor({ topic, minWords, onCheck }: WritingEditorProps) {
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const isReady = wordCount >= minWords;

  const handleCheck = async () => {
    if (!isReady) return;
    setIsChecking(true);
    const result = await onCheck(content);
    setFeedback(result);
    setIsChecking(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[48px] border border-zinc-100 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#58007E]/5 text-[#58007E] rounded-xl">
              <PenTool size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black italic font-serif">Writing: {topic}</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Target: {minWords} Words</p>
            </div>
          </div>
          <button 
            onClick={() => { setContent(''); setFeedback(null); }}
            className="p-10 text-zinc-300 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your passage here..."
          className="w-full h-80 bg-zinc-50 rounded-3xl p-8 outline-none focus:bg-white focus:ring-4 ring-[#58007E]/5 transition-all text-zinc-700 font-medium leading-relaxed resize-none border-0"
        />

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isReady ? 'text-emerald-500' : 'text-amber-500'}`}>
                Words: {wordCount} / {minWords}
              </span>
              {isReady && <CheckCircle size={14} className="text-emerald-500" />}
            </div>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
              className={`h-full transition-all ${isReady ? 'bg-emerald-500' : 'bg-[#58007E]'}`}
            />
          </div>
        </div>

        <button 
          onClick={handleCheck}
          disabled={!isReady || isChecking}
          className={`mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isReady ? 'bg-[#58007E] text-white hover:bg-[#40005C] shadow-xl' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
        >
          {isChecking ? 'AI Analyzing...' : <><Sparkles size={18} /> Get AI Feedback</>}
        </button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-emerald-100 p-10 rounded-[48px] shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100"><Sparkles size={24} /></div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Coach Feedback</h4>
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">REVIEWED BY AI</p>
              </div>
            </div>
            <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-50 leading-relaxed font-medium text-zinc-700 whitespace-pre-wrap">
              {feedback}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

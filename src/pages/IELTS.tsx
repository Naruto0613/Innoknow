import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateCustomPrompt } from '../utils/ai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Trophy, 
  MessageCircle,
  HelpCircle,
  PlayCircle,
  Award,
  ChevronRight
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function IELTS() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
  }

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const prompt = `Student (${profile?.level || 'A1'} level) says: "${text}"\nPrevious conversation:\n${messages.map(m => `${m.role}: ${m.text}`).join('\n')}`;
      const systemInstruction = `You are an expert IELTS Speaking Tutor. You are helping a student prepare for the speaking exam. 
      Keep your responses professional yet encouraging. Focus on IELTS criteria: Fluency, Lexical Resource, Grammatical Range, and Pronunciation.
      Keep your replies concise to maintain a natural conversation flow.`;

      const responseText = await generateCustomPrompt(prompt, systemInstruction);
      const modelMessage: Message = { role: 'model', text: responseText || '' };
      setMessages(prev => [...prev, modelMessage]);

      // Trigger automatic feedback every few messages
      if (messages.length > 0 && messages.length % 3 === 0) {
        analyzeProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const conversation = messages.map(m => `${m.role}: ${m.text}`).join('\n');
      const feedbackText = await generateCustomPrompt(
        `Please analyze this IELTS speaking practice session and provide feedback on: 1. Grammatical Range, 2. Lexical Resource, 3. Estimated Band Score (4.0-9.0), 4. Key Improvements needed.\n\nConversation:\n${conversation}`,
        "You are an IELTS examiner. Provide a structured, helpful analysis of the student's performance."
      );
      setFeedback(feedbackText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-100px)] flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-[48px] border border-zinc-100 shadow-2xl overflow-hidden flex flex-col relative">
          <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#58007E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#58007E]/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight italic font-serif">IELTS Speaking Coach</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Session • {profile?.level || 'A1'} Level</span>
                </div>
              </div>
            </div>
            <button onClick={analyzeProgress} className="bg-white border border-zinc-100 p-3 rounded-xl text-zinc-400 hover:text-[#58007E] hover:border-[#58007E]/20 transition-all">
              <Trophy size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-zinc-50/30">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8">
                <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl flex items-center justify-center text-[#58007E]">
                  <MessageCircle size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic font-serif mb-3">Ready to practice?</h3>
                  <p className="text-sm text-zinc-500 font-medium">I'm your IELTS examiner. Let's start with Part 1 questions about your hobbies or studies.</p>
                </div>
                <button 
                  onClick={() => handleSend("Hello, I am ready to start my IELTS speaking practice.")} 
                  className="bg-[#58007E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#58007E]/20 flex items-center gap-2 hover:bg-[#40005C] transition-all"
                >
                  <PlayCircle size={18} /> Start Session
                </button>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-6 rounded-[32px] shadow-sm ${m.role === 'user' ? 'bg-[#58007E] text-white border-transparent' : 'bg-white text-zinc-800 border border-zinc-100'}`}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-[24px] border border-zinc-100 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#58007E] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#58007E] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#58007E] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-zinc-100">
            <div className="relative flex items-center gap-4">
              <button 
                onClick={toggleRecording}
                className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-100' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900'}`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Listening to you..." : "Share your response..."}
                className="flex-1 bg-zinc-50 border-0 focus:ring-4 ring-[#58007E]/5 p-5 rounded-2xl outline-none text-sm font-bold transition-all"
              />
              <button 
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-14 h-14 bg-[#58007E] text-white rounded-2xl shadow-xl shadow-[#58007E]/10 hover:bg-[#40005C] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-[#141414] text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <Award className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" /> IELTS Performance
            </h3>
            <div className="flex items-end gap-2 mb-8">
               <span className="text-7xl font-black italic leading-none">7.5</span>
               <span className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Estimated</span>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Fluency', score: 8.0, color: 'bg-emerald-500' },
                { label: 'Grammar', score: 7.0, color: 'bg-indigo-500' },
                { label: 'Vocabulary', score: 7.5, color: 'bg-amber-500' }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-2">
                    <span className="opacity-60">{stat.label}</span>
                    <span>{stat.score}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color}`} style={{ width: `${(stat.score / 9) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white border border-zinc-100 rounded-[48px] p-10 shadow-sm overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#58007E] flex items-center gap-2">
                  <Sparkles size={16} /> Examiner Insights
                </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
               {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center h-full text-zinc-300 gap-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-[#58007E] border-t-transparent rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-widest">AI analysis underway...</p>
                 </div>
               ) : feedback ? (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-zinc prose-sm whitespace-pre-wrap font-medium text-zinc-600 leading-loose italic bg-zinc-50 p-6 rounded-3xl"
                 >
                    {feedback}
                 </motion.div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center text-zinc-300 gap-4 opacity-50">
                    <HelpCircle size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Ongoing feedback will be provided here.</p>
                 </div>
               )}
             </div>
             
             <button onClick={analyzeProgress} className="mt-8 w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#58007E] transition-all flex items-center justify-center gap-2">
                Generate Full Report <ChevronRight size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

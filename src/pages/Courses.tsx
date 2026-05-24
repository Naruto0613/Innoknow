import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { getSpeakingFeedback } from '../utils/ai';
import WritingEditor from '../components/WritingEditor';
import { 
  BookOpen, 
  Mic, 
  Headphones, 
  PenTool, 
  Play, 
  Pause, 
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Filter,
  Clock,
  Check,
  RotateCcw,
  CheckCircle,
  Award
} from 'lucide-react';

// Rest of the data (passages, topics) remains the same but UI is updated
// ... [keeping existing passages and topics data]

// --- Types ---
type Section = 'Reading' | 'Listening' | 'Speaking' | 'Writing';

interface Passage {
  id: string;
  title: string;
  tense: string;
  wordCount: number;
  content: string;
  level: string;
}

// --- Data ---
const passages: Passage[] = [
  {
    id: 'present',
    title: 'Daily Student Life',
    tense: 'Present Simple',
    wordCount: 81,
    content: "My name is Setsen, and I am a student. Every morning, I wake up at 7 o'clock and wash my face. I eat breakfast with my parents and go to the university. I study English and history because I want to become a teacher. In the afternoon, I meet my friends and we play basketball together. I usually return home at 6 PM and help my mother with dinner. I really enjoy my busy but productive life.",
    level: 'A1'
  },
  {
    id: 'past',
    title: 'A Weekend Visit',
    tense: 'Past Simple',
    wordCount: 79,
    content: "Last weekend, I visited my grandmother in the countryside. I arrived on Saturday morning and stayed until Sunday evening. We cooked traditional food and walked in the fresh air. My grandmother told many stories about the past. I cleaned the house and helped her in the garden. In the evening, we watched the stars together. It was a very peaceful and happy weekend. I enjoyed every moment of my visit and promised to return very soon.",
    level: 'A2'
  },
  {
    id: 'future',
    title: 'Summer Dreams',
    tense: 'Future Simple',
    wordCount: 77,
    content: "Next summer, I will travel to another country with my best friend. We will visit famous museums and try local dishes. I will practice my English every day with different people. We will stay in a small hotel near the city center. I will buy some souvenirs for my family and friends. It will be an amazing adventure for both of us. I think we will learn many interesting things during our journey.",
    level: 'B1'
  },
  {
    id: 'b2-work',
    title: 'Professional Growth',
    tense: 'Present Perfect',
    wordCount: 85,
    content: "I have worked for this international company for three years now. Recently, I have completed a major project that involved coordinating with teams from Europe and Asia. This experience has improved my communication skills significantly. I have learned how to manage tight deadlines and complex requests. My manager has praised my dedication and technical knowledge. I have already started preparing for my next career move within the organization.",
    level: 'B2'
  },
  {
    id: 'c1-academic',
    title: 'Sustainability Research',
    tense: 'Mixed Tenses',
    wordCount: 92,
    content: "Sustainability has become a critical research area in modern academia. Scholars have argued that without immediate intervention, global ecosystems will face irreversible damage. I had been studying environmental science for five years before I decided to focus specifically on renewable energy solutions. If governments implement stricter regulations today, future generations might enjoy a cleaner planet. It is imperative that we continue to develop innovative technologies to mitigate the effects of climate change.",
    level: 'C1'
  }
];

const speakingTopics = [
  { topic: 'My Family', level: 'A1' },
  { topic: 'My Best Friend', level: 'A1' },
  { topic: 'My House', level: 'A1' },
  { topic: 'My Daily Routine', level: 'A2' },
  { topic: 'My Weekend', level: 'A2' },
  { topic: 'My Hometown Ulaanbaatar', level: 'B1' },
  { topic: 'My Favorite Season', level: 'B1' },
  { topic: 'Global Warming Effects', level: 'B2' },
  { topic: 'The Power of Social Media', level: 'B2' },
  { topic: 'Future of Artificial Intelligence', level: 'C1' },
  { topic: 'The Ethics of Genetic Engineering', level: 'C1' }
];

interface WritingTopic {
  topic: string;
  level: string;
  minWords: number;
}

const writingTopics: WritingTopic[] = [
  { topic: 'My Family', level: 'A1', minWords: 60 },
  { topic: 'My Weekend', level: 'A1', minWords: 60 },
  { topic: 'My School Life', level: 'A2', minWords: 80 },
  { topic: 'My Dream', level: 'B1', minWords: 80 },
  { topic: 'Modern Technology', level: 'B2', minWords: 120 },
  { topic: 'Work-Life Balance', level: 'B2', minWords: 120 },
  { topic: 'Ethics in Science', level: 'C1', minWords: 150 },
  { topic: 'Cognitive Biases in Decision Making', level: 'C1', minWords: 200 }
];

// --- Helpers ---
const highlightGrammar = (text: string, tense: string) => {
  if (tense === 'Past Simple') {
    return text.split(' ').map((word, i) => {
      const cleanWord = word.replace(/[.,]/g, '');
      const isPast = ['visited', 'arrived', 'stayed', 'cooked', 'walked', 'told', 'cleaned', 'helped', 'watched', 'was', 'enjoyed', 'promised'].includes(cleanWord.toLowerCase());
      return <span key={i} className={isPast ? 'bg-amber-100 text-amber-700 px-0.5 rounded' : ''}>{word} </span>;
    });
  }
  if (tense === 'Present Simple') {
    return text.split(' ').map((word, i) => {
      const cleanWord = word.replace(/[.,]/g, '');
      const isPresent = ['is', 'am', 'wake', 'wash', 'eat', 'go', 'study', 'want', 'become', 'meet', 'play', 'return', 'help', 'enjoy'].includes(cleanWord.toLowerCase());
      return <span key={i} className={isPresent ? 'bg-emerald-100 text-emerald-700 px-0.5 rounded' : ''}>{word} </span>;
    });
  }
  if (tense === 'Future Simple') {
    return text.split(' ').map((word, i) => {
      const cleanWord = word.replace(/[.,]/g, '');
      const isFuture = cleanWord.toLowerCase() === 'will';
      const isFutureVerb = i > 0 && text.split(' ')[i-1]?.replace(/[.,]/g, '').toLowerCase() === 'will';
      return <span key={i} className={isFuture || isFutureVerb ? 'bg-indigo-100 text-indigo-700 px-0.5 rounded' : ''}>{word} </span>;
    });
  }
  return text;
};

// --- Components ---
export default function Courses() {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const userLevel = profile?.level || 'A1';
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Section>('Reading');
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [writingContent, setWritingContent] = useState('');
  const [selectedWritingTopic, setSelectedWritingTopic] = useState<WritingTopic | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState<string | null>(null);
  const [isCheckingSpeaking, setIsCheckingSpeaking] = useState(false);
  const [filterByLevel, setFilterByLevel] = useState(true);

  // Level progression mapping
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  const handleLevelChange = async (newLevel: string) => {
    if (isUpdatingLevel || newLevel === userLevel) return;
    setIsUpdatingLevel(true);
    try {
      await updateProfile({ level: newLevel });
    } catch (error) {
      console.error("Failed to update level:", error);
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const isAvailable = (itemLevel: string) => {
    if (!filterByLevel) return true;
    const userIdx = levelOrder.indexOf(userLevel);
    const itemIdx = levelOrder.indexOf(itemLevel);
    
    // Safety check for unknown levels
    if (userIdx === -1 || itemIdx === -1) return true;
    
    // User sees items at their level or below
    return itemIdx <= userIdx;
  };

  const filteredPassages = useMemo(() => passages.filter(p => isAvailable(p.level)), [userLevel, filterByLevel]);
  const filteredSpeaking = useMemo(() => speakingTopics.filter(t => isAvailable(t.level)), [userLevel, filterByLevel]);
  const filteredWriting = useMemo(() => writingTopics.filter(t => isAvailable(t.level)), [userLevel, filterByLevel]);

  useEffect(() => {
    // Reset selections when tab or level changes to avoid showing content no longer filtered
    setSelectedPassage(null);
  }, [activeTab, userLevel]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
        checkSpeakingWithAI(text);
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      setRecognition(rec);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full shadow-lg shadow-indigo-100"
        />
      </div>
    );
  }

  const handlePlayAudio = (passage: Passage) => {
    if (isPlaying === passage.id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(passage.content);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(null);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(passage.id);
    }
  };

  const handleStartRecording = () => {
    if (!recognition) return;
    setTranscript('');
    setIsRecording(true);
    recognition.start();
  };

  const checkWithAI = async () => {
    if (!writingContent || !selectedWritingTopic) return;
    setIsCheckingAI(true);
    setAiFeedback(null);
    try {
      const response = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: writingContent, 
          topic: selectedWritingTopic.topic, 
          level: selectedWritingTopic.level 
        })
      });
      const data = await response.json();
      setAiFeedback(data.feedback);
    } catch (error) {
      console.error(error);
      setAiFeedback("Sorry, I encountered an error while reviewing your work.");
    } finally {
      setIsCheckingAI(false);
    }
  };

  const checkSpeakingWithAI = async (text: string) => {
    setIsCheckingSpeaking(true);
    setSpeakingFeedback(null);
    try {
      const response = await fetch('/api/ai/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: text, 
          context: 'General speaking practice' 
        })
      });
      const data = await response.json();
      setSpeakingFeedback(data.feedback);
    } catch (error) {
      console.error(error);
      setSpeakingFeedback("Failed to analyze speaking.");
    } finally {
      setIsCheckingSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex-1">
            <h1 className="text-5xl font-black italic font-serif text-slate-900 tracking-tight mb-4">Learning Hub</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-slate-500 font-medium">Courses personalized for your <span className="text-indigo-600 font-black">{userLevel}</span> level.</p>
              <div className="flex bg-slate-200 p-1 rounded-xl">
                 {levelOrder.map(lvl => (
                   <button
                    key={lvl}
                    onClick={() => handleLevelChange(lvl)}
                    disabled={isUpdatingLevel}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${userLevel === lvl ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
                   >
                     {lvl}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setFilterByLevel(!filterByLevel)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${filterByLevel ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <Filter size={14} /> {filterByLevel ? 'Filter Level: ON' : 'Show All Content'}
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { id: 'Reading', icon: BookOpen, color: 'indigo' },
            { id: 'Listening', icon: Headphones, color: 'emerald' },
            { id: 'Speaking', icon: Mic, color: 'amber' },
            { id: 'Writing', icon: PenTool, color: 'violet' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Section)}
              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${activeTab === tab.id ? `bg-${tab.color}-600 border-${tab.color}-600 text-white shadow-2xl` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              <tab.icon size={32} className={`${activeTab === tab.id ? 'text-white' : `text-${tab.color}-500`} group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.id}</span>
              {activeTab === tab.id && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* --- Reading Section --- */}
          {activeTab === 'Reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {filteredPassages.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">{p.tense}</div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LEVEL {p.level}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">{p.wordCount} WORDS</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed font-medium">
                    {p.content}
                  </p>
                  <button 
                    onClick={() => setSelectedPassage(p)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    Read Full <ArrowRight size={16} />
                  </button>
                </div>
              ))}
              {filteredPassages.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching content for your level yet.</p>
                 </div>
              )}
            </motion.div>
          )}

          {/* --- Listening Section --- */}
          {activeTab === 'Listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-1 gap-6"
            >
              {filteredPassages.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0">
                    <Headphones size={40} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.tense}</span>
                       <span className="text-[10px] font-bold text-slate-300">• {p.wordCount} WORDS</span>
                       <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded uppercase">{p.level}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 italic font-serif">{p.title}</h3>
                  </div>

                  {/* Waveform Mockup */}
                  <div className="flex-1 flex items-end gap-1 h-12 overflow-hidden px-4">
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                      <motion.div 
                        key={i}
                        animate={isPlaying === p.id ? { height: [8, 24, 12, 32, 16, 28, 8] } : { height: 8 }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                        className={`w-1 rounded-full ${isPlaying === p.id ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePlayAudio(p)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying === p.id ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700'}`}
                  >
                    {isPlaying === p.id ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* --- Speaking Section --- */}
          {activeTab === 'Speaking' && (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="md:col-span-full bg-indigo-900 p-10 rounded-[48px] text-white overflow-hidden relative mb-4">
                 <div className="relative z-10 max-w-xl">
                    <h2 className="text-4xl font-black italic font-serif mb-4">AI Speaking Coach</h2>
                    <p className="text-indigo-100 opacity-70 font-medium leading-relaxed">Choose a topic below and practice your speaking. Our AI will transcribe your words in real-time.</p>
                 </div>
                 {transcript && (
                    <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="relative z-10 mt-8 space-y-4"
                    >
                      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                        <p className="text-xs font-black uppercase text-indigo-300 mb-4 tracking-widest">Transcription:</p>
                        <p className="text-lg font-medium italic">"{transcript}"</p>
                      </div>

                      <AnimatePresence>
                        {(isCheckingSpeaking || speakingFeedback) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/20 backdrop-blur-xl p-8 rounded-3xl border border-amber-500/20"
                          >
                             <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="text-amber-400" size={20} />
                                <p className="text-xs font-black uppercase text-amber-200 tracking-widest">Coach Feedback</p>
                             </div>
                             {isCheckingSpeaking ? (
                               <div className="flex items-center gap-2 text-white">
                                 <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                 />
                                 <span className="text-sm font-medium italic">Analyzing your response...</span>
                               </div>
                             ) : (
                               <p className="text-white font-medium italic leading-relaxed">"{speakingFeedback}"</p>
                             )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                 <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
              </div>

              {filteredSpeaking.map(item => (
                <div key={item.topic} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center justify-between group">
                  <div>
                    <h3 className="font-extrabold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">{item.topic}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic</p>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded uppercase">{item.level}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'}`}
                  >
                    <Mic size={24} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* --- Writing Section --- */}
          {activeTab === 'Writing' && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest px-4">Topics</h3>
                <div className="flex flex-col gap-3">
                  {filteredWriting.map(item => (
                    <button 
                      key={item.topic}
                      onClick={() => {
                        setSelectedWritingTopic(item);
                        setWritingContent('');
                        setAiFeedback(null);
                      }}
                      className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative group ${selectedWritingTopic?.topic === item.topic ? 'bg-indigo-50 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-extrabold ${selectedWritingTopic?.topic === item.topic ? 'text-indigo-600' : 'text-slate-800'}`}>{item.topic}</h4>
                          <span className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-black text-slate-400 rounded uppercase border border-slate-100">{item.level}</span>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {item.minWords} words</p>
                       
                       {selectedWritingTopic?.topic === item.topic && (
                         <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-110 shadow-lg">
                           <Check size={14} />
                         </div>
                       )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedWritingTopic ? (
                    <motion.div 
                      key="editor"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                                <PenTool size={20} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black italic font-serif">Writing: {selectedWritingTopic.topic}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Word Requirement: {selectedWritingTopic.minWords}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <button onClick={() => {
                                 setWritingContent('');
                                 setAiFeedback(null);
                               }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><RotateCcw size={18} /></button>
                            </div>
                        </div>

                        <textarea 
                          value={writingContent}
                          onChange={(e) => setWritingContent(e.target.value)}
                          placeholder="Compose your passage here..."
                          className="w-full h-80 bg-slate-50 rounded-3xl p-8 outline-none focus:bg-white focus:ring-2 ring-violet-100 transition-all text-slate-700 font-medium leading-relaxed resize-none border-0"
                        />

                        {/* Word Count & Status */}
                        <div className="mt-6 flex flex-col gap-4">
                          <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${writingContent.split(' ').filter(w => w.length > 0).length >= selectedWritingTopic.minWords ? 'text-emerald-500' : 'text-red-500'}`}>
                                Word Count: {writingContent.split(' ').filter(w => w.length > 0).length} / {selectedWritingTopic.minWords}
                              </span>
                              {writingContent.split(' ').filter(w => w.length > 0).length >= selectedWritingTopic.minWords && (
                                <CheckCircle size={14} className="text-emerald-500" />
                              )}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI CHECK READY</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (writingContent.split(' ').filter(w => w.length > 0).length / selectedWritingTopic.minWords) * 100)}%` }}
                              className={`h-full transition-colors ${writingContent.split(' ').filter(w => w.length > 0).length >= selectedWritingTopic.minWords ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            />
                          </div>
                        </div>

                        <div className="mt-8">
                          <button 
                            onClick={checkWithAI}
                            disabled={isCheckingAI || writingContent.split(' ').filter(w => w.length > 0).length < selectedWritingTopic.minWords}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 ${writingContent.split(' ').filter(w => w.length > 0).length >= selectedWritingTopic.minWords ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                          >
                            {isCheckingAI ? 'Analyzing with AI...' : <><Sparkles size={18} /> Review & Grade</>}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {aiFeedback && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border-2 border-violet-100 p-10 rounded-[48px] shadow-2xl relative"
                          >
                            <button onClick={() => setAiFeedback(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={20} /></button>
                            <div className="flex items-center gap-4 mb-6">
                               <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"><Award size={24} /></div>
                               <div>
                                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Instructor Feedback</h4>
                                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">GENERATED BY AI COACH</p>
                               </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                               <p className="text-slate-700 font-medium leading-loose italic">"{aiFeedback}"</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center bg-white rounded-[48px] border-2 border-dashed border-slate-200 p-20 text-center"
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                        <PenTool size={40} />
                      </div>
                      <h4 className="text-lg font-black text-slate-800 mb-2">Select a Topic</h4>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto">Choose an assignment from the list to start your writing practice.</p>
                    </motion.div>
                  ) }
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reading Modal */}
      <AnimatePresence>
        {selectedPassage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPassage(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg inline-block">
                      {selectedPassage.tense}
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-[8px] font-black text-slate-600 rounded uppercase">{selectedPassage.level}</span>
                  </div>
                  <h2 className="text-3xl font-black italic font-serif text-slate-900">{selectedPassage.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedPassage(null)}
                  className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-12 overflow-y-auto max-h-[60vh] scrollbar-hide">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl text-slate-700 leading-loose font-medium opacity-90 indent-8">
                    {highlightGrammar(selectedPassage.content, selectedPassage.tense)}
                  </p>
                </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
                       <Clock size={12} /> 2 min read
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
                       <TrendingUp size={12} /> {selectedPassage.wordCount} words
                    </span>
                 </div>
                 <button 
                  onClick={() => setSelectedPassage(null)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                 >
                   Done Reading
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide {
           -ms-overflow-style: none;  /* IE and Edge */
           scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
           display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
}

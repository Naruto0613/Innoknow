import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Play, 
  X, 
  Check, 
  Loader2, 
  Volume2, 
  Compass, 
  CheckCircle2, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  type: 'flashcard' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'quiz' | string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  instructionsMn: string;
  instructionsEn: string;
  xpReward: number;
  timeLimit: number; // in mins, 0 = no limit
  content: any; // varies by type
  isPremium: boolean;
  isPublished: boolean;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

const SKILL_TYPES = [
  { value: 'flashcard', label: '🎴 Flashcard Set (Багц хөзөр)' },
  { value: 'reading', label: '📖 Reading Exercise (Унших дасгал)' },
  { value: 'listening', label: '🎧 Listening Exercise (Сонсох дасгал)' },
  { value: 'speaking', label: '🗣️ Speaking Prompt (Ярианы сэдэв)' },
  { value: 'writing', label: '✍️ Writing Task (Бичих даалгавар)' },
  { value: 'grammar', label: '🔧 Grammar Drill (Дүрмийн дасгал)' },
  { value: 'quiz', label: '🎯 Mini Quiz (Мини сорил)' }
];

export default function SkillsManager() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog / Modal States to bypass iframe confirm/alert blocks
  const [alertState, setAlertState] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertState({ message, type });
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmState({ message, action });
  };

  // Local override of alert() to safely render custom modals inside sandboxed iframes
  const alert = (message: string) => {
    showAlert(message, 'info');
  };

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('flashcard');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  const [topic, setTopic] = useState('');
  const [instructionsMn, setInstructionsMn] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [xpReward, setXpReward] = useState<number>(30);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');

  // --- SUB-CONTENT STATES (Varies depending on type) ---
  
  // 1. Flashcards (pairs: english -> mongolian)
  const [fcPairs, setFcPairs] = useState<{ en: string; mn: string }[]>([]);
  const [fcEn, setFcEn] = useState('');
  const [fcMn, setFcMn] = useState('');

  // 2. Reading
  const [readingPassage, setReadingPassage] = useState('');
  // 3. Listening
  const [ttsScript, setTtsScript] = useState('');
  
  // Shared Questions list for Reading, Listening and Quiz types
  const [comprehensionQuestions, setComprehensionQuestions] = useState<any[]>([]);
  const [qText, setQText] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');

  // 4. Speaking
  const [speakingPrompt, setSpeakingPrompt] = useState('');
  const [speakingExample, setSpeakingExample] = useState('');
  const [speakingHints, setSpeakingHints] = useState('');

  // 5. Writing
  const [writingDescription, setWritingDescription] = useState('');
  const [writingMinCount, setWritingMinCount] = useState<number>(50);
  const [writingExample, setWritingExample] = useState('');
  const [aiFeedbackEnabled, setAiFeedbackEnabled] = useState(true);

  // 6. Grammar Drill
  const [grammarExplanation, setGrammarExplanation] = useState('');
  const [grammarBlanks, setGrammarBlanks] = useState<{ sentence: string; answer: string }[]>([]);
  const [blankSentence, setBlankSentence] = useState('');
  const [blankAnswer, setBlankAnswer] = useState('');

  // 7. Mini Quiz
  const [passPercentage, setPassPercentage] = useState<number>(80);
  const [quizTimerOption, setQuizTimerOption] = useState(false);

  // Load Skills from DB with local caching fallback
  const loadSkills = async () => {
    setLoading(true);
    let loaded: Skill[] = [];
    try {
      const snap = await getDocs(collection(db, 'skills'));
      snap.forEach(docSnap => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Skill);
      });
      localStorage.setItem('innoknow_skills_admin_backup', JSON.stringify(loaded));
    } catch (e) {
      console.warn("Firestore error while loading skills, querying backup:", e);
      try {
        const cached = localStorage.getItem('innoknow_skills_admin_backup');
        if (cached) loaded = JSON.parse(cached);
      } catch (innerErr) {}
    }
    // Sort
    loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setSkills(loaded);
    setLoading(false);
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setName('');
    setType('flashcard');
    setLevel('A1');
    setTopic('');
    setInstructionsMn('');
    setInstructionsEn('');
    setXpReward(30);
    setTimeLimit(0);
    setIsPremium(false);
    setIsPublished(true);

    // subcontent clears
    setFcPairs([]);
    setFcEn('');
    setFcMn('');
    setReadingPassage('');
    setTtsScript('');
    setComprehensionQuestions([]);
    setQText('');
    setQCorrect('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setSpeakingPrompt('');
    setSpeakingExample('');
    setSpeakingHints('');
    setWritingDescription('');
    setWritingMinCount(50);
    setWritingExample('');
    setAiFeedbackEnabled(true);
    setGrammarExplanation('');
    setGrammarBlanks([]);
    setBlankSentence('');
    setBlankAnswer('');
    setPassPercentage(80);
    setQuizTimerOption(false);
  };

  // TTS preview speech helper
  const handlePlayTTS = (script: string) => {
    if (!script.trim()) {
      alert('Сонсох текстийг бичнэ үү.');
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(script);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  // Add/remove pairs dynamically
  const handleAddFcPair = () => {
    if (!fcEn.trim() || !fcMn.trim()) return;
    setFcPairs([...fcPairs, { en: fcEn.trim(), mn: fcMn.trim() }]);
    setFcEn('');
    setFcMn('');
  };

  const handleRemoveFcPair = (idx: number) => {
    setFcPairs(fcPairs.filter((_, i) => i !== idx));
  };

  // Add questions for Reading, Listening, Quiz types
  const handleAddCompQuestion = () => {
    if (!qText.trim() || !qCorrect.trim()) {
      alert('Асуулт болон зөв хариултыг бөглөнө үү.');
      return;
    }
    const newQ = {
      questionText: qText.trim(),
      options: [qOpt1.trim(), qOpt2.trim(), qOpt3.trim(), qOpt4.trim()].filter(Boolean),
      correctAnswer: qCorrect.trim()
    };
    setComprehensionQuestions([...comprehensionQuestions, newQ]);
    setQText('');
    setQCorrect('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
  };

  const handleRemoveCompQuestion = (idx: number) => {
    setComprehensionQuestions(comprehensionQuestions.filter((_, i) => i !== idx));
  };

  // Add Blank Sentences for Grammar Drill
  const handleAddGrammarBlank = () => {
    if (!blankSentence.trim() || !blankAnswer.trim()) return;
    setGrammarBlanks([...grammarBlanks, { sentence: blankSentence.trim(), answer: blankAnswer.trim() }]);
    setBlankSentence('');
    setBlankAnswer('');
  };

  const handleRemoveGrammarBlank = (idx: number) => {
    setGrammarBlanks(grammarBlanks.filter((_, i) => i !== idx));
  };

  // Construct Type-Specific Content Objects
  const buildContentObject = () => {
    switch (type) {
      case 'flashcard':
        return { pairs: fcPairs };
      case 'reading':
        return { passage: readingPassage.trim(), questions: comprehensionQuestions };
      case 'listening':
        return { script: ttsScript.trim(), questions: comprehensionQuestions };
      case 'speaking':
        return { prompt: speakingPrompt.trim(), exampleAnswer: speakingExample.trim(), hints: speakingHints.split(',').map(h => h.trim()).filter(Boolean) };
      case 'writing':
        return { description: writingDescription.trim(), minWordCount: Number(writingMinCount) || 50, exampleAnswer: writingExample.trim(), aiFeedbackEnabled };
      case 'grammar':
        return { explanation: grammarExplanation.trim(), blanks: grammarBlanks };
      case 'quiz':
        return { questions: comprehensionQuestions, timerOption: quizTimerOption, passScorePercentage: passPercentage };
      default:
        return {};
    }
  };

  // Submit form
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !topic.trim()) {
      alert('Дасгалын нэр болон сэдвийг бөглөнө үү.');
      return;
    }

    setSaving(true);
    const skillId = editingId || 'skill_' + Date.now();
    const payload = {
      name: name.trim(),
      type,
      level,
      topic: topic.trim(),
      instructionsMn: instructionsMn.trim(),
      instructionsEn: instructionsEn.trim(),
      xpReward: Number(xpReward) || 30,
      timeLimit: Number(timeLimit) || 0,
      content: buildContentObject(),
      isPremium,
      isPublished,
      addedBy: user?.uid || 'admin',
      createdAt: editingId ? (skills.find(s => s.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'skills', skillId), payload);
      alert(editingId ? 'Дасгалыг амжилттай шинэчиллээ!' : 'Шинэ дасгал даалгаврыг амжилттай бүртгэж нийтэллээ!');
      clearForm();
      loadSkills();
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `skills/${skillId}`);
      } catch (jsonErr: any) {
        alert(`Алдаа гарлаа: ${jsonErr.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Edit pre-fill
  const handleEditSkill = (s: Skill) => {
    setEditingId(s.id);
    setName(s.name);
    setType(s.type);
    setLevel(s.level);
    setTopic(s.topic);
    setInstructionsMn(s.instructionsMn || '');
    setInstructionsEn(s.instructionsEn || '');
    setXpReward(s.xpReward);
    setTimeLimit(s.timeLimit || 0);
    setIsPremium(!!s.isPremium);
    setIsPublished(!!s.isPublished);

    // subcontent loads
    const cnt = s.content || {};
    if (s.type === 'flashcard') {
      setFcPairs(cnt.pairs || []);
    } else if (s.type === 'reading') {
      setReadingPassage(cnt.passage || '');
      setComprehensionQuestions(cnt.questions || []);
    } else if (s.type === 'listening') {
      setTtsScript(cnt.script || '');
      setComprehensionQuestions(cnt.questions || []);
    } else if (s.type === 'speaking') {
      setSpeakingPrompt(cnt.prompt || '');
      setSpeakingExample(cnt.exampleAnswer || '');
      setSpeakingHints(cnt.hints?.join(', ') || '');
    } else if (s.type === 'writing') {
      setWritingDescription(cnt.description || '');
      setWritingMinCount(cnt.minWordCount || 50);
      setWritingExample(cnt.exampleAnswer || '');
      setAiFeedbackEnabled(cnt.aiFeedbackEnabled !== false);
    } else if (s.type === 'grammar') {
      setGrammarExplanation(cnt.explanation || '');
      setGrammarBlanks(cnt.blanks || []);
    } else if (s.type === 'quiz') {
      setComprehensionQuestions(cnt.questions || []);
      setQuizTimerOption(!!cnt.timerOption);
      setPassPercentage(cnt.passScorePercentage || 80);
    }

    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Duplication capability! "creates a copy to modify"
  const handleDuplicateSkill = async (s: Skill) => {
    setSaving(true);
    const newId = 'skill_dup_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const payload = {
      ...s,
      name: `${s.name} (Хуулбар)`,
      isPublished: false, // set draft by default for copy
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete (payload as any).id; // drop old key to avoid confusion

    try {
      await setDoc(doc(db, 'skills', newId), payload);
      alert('Дасгалыг амжилттай олшруулан хууллаа! Та хүсвэл одоо өөрчлөлт засалт хийх боломжтой.');
      loadSkills();
    } catch (err) {
      console.error(err);
      alert('Уг хэсгийг хуулбарлахад алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDeleteSkill = async (s: Skill) => {
    showConfirm(`"${s.name}" дасгалыг устгахдаа итгэлтэй байна уу?`, async () => {
      try {
        await deleteDoc(doc(db, 'skills', s.id));
        showAlert('Амжилттай устгагдлаа.', 'success');
        loadSkills();
      } catch (err) {
        console.error(err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `skills/${s.id}`);
        } catch (jsonErr: any) {
          showAlert(`Алдаа гарлаа: ${jsonErr.message}`, 'error');
        }
      }
    });
  };

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchType = filterType === 'All' || s.type === filterType;
      const matchLvl = filterLevel === 'All' || s.level === filterLevel;
      return matchType && matchLvl;
    });
  }, [skills, filterType, filterLevel]);

  return (
    <div className="space-y-8">
      {/* Skill Indicator Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Compass size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Ур чадварын сорил дасгалууд</h4>
            <p className="text-xs text-slate-400 font-semibold">Хичээлээс гадна сурагчид өөрийгөө сорих интерактив жижиг даалгаварууд</p>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Архив: <strong className="text-indigo-600 font-black">{skills.length} Exercise Set</strong> нийтлэгдсэн байна.
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm text-left">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plus className="text-indigo-600" />
            {editingId ? 'Дасгал, даалгаврын карт засах' : 'Шинэ Дасгал / Сорил үүсгэх бүртгэл'}
          </h3>
          {editingId && (
            <button
              onClick={clearForm}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} /> Засварыг цуцлах
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSkill} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Дасгалын Нэр (Skill Name) *</label>
              <input 
                type="text"
                placeholder="Жишээ: IELTS Flashcards Set 1, Reading Comp A2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Сэдэв (Topic) *</label>
              <input 
                type="text"
                placeholder="Жишээ: Environment, Business meetings"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white outline-none focus:border-indigo-505"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Дасгалын төрөл (Skill Type)</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  // Clear questions/blanks when type changes to prevent trash in database
                  setComprehensionQuestions([]);
                  setFcPairs([]);
                  setGrammarBlanks([]);
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-705 outline-none focus:bg-white"
              >
                {SKILL_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Түвшин (Level)</label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-705 outline-none focus:bg-white"
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper-Intermediate</option>
                <option value="C1">C1 Advanced</option>
                <option value="C2">C2 Mastery</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">XP урамшуулал</label>
              <input 
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-center outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Цагийн хязгаар (0 - Хязгааргүй)</label>
              <input 
                type="number"
                placeholder="Минутаар"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-center outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block font-normal">Монгол заавар (Instructions Mongolian)</label>
              <textarea
                rows={2}
                placeholder="Сурагч хэрхэн дасгалтай ажиллах тухай заавар Монголоор..."
                value={instructionsMn}
                onChange={(e) => setInstructionsMn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block font-normal">Англи заавар (Instructions English)</label>
              <textarea
                rows={2}
                placeholder="Instructions on how to complete the drill in English..."
                value={instructionsEn}
                onChange={(e) => setInstructionsEn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* DYNAMIC CONTENT TYPE PANELS */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-xs font-black text-[#58007E] uppercase tracking-widest bg-[#58007E]/5 px-4 py-2.5 rounded-xl inline-block">
              {type.toUpperCase()} - Дасгалын Агуулга тохируулах
            </h4>

            {/* TYPE 1: FLASHCARDS CONTENT BUILDER */}
            {type === 'flashcard' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-xs font-black text-slate-500">Үгийн хосууд нэмэх бүртгэл (Pair Builder)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Англи үг: E.g., Accomplish"
                      value={fcEn}
                      onChange={(e) => setFcEn(e.target.value)}
                      className="bg-white border border-slate-100 p-2.5 rounded-xl text-xs font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Монгол орчуулга: E.g., Гүйцэтгэх"
                      value={fcMn}
                      onChange={(e) => setFcMn(e.target.value)}
                      className="bg-white border border-slate-100 p-2.5 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFcPair}
                    className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-black rounded-lg uppercase"
                  >
                    + Хөзрийн хос нэмэх
                  </button>
                </div>

                {fcPairs.length > 0 && (
                  <div className="border border-slate-100 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fcPairs.map((pair, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs font-bold flex justify-between items-center text-slate-700">
                        <span><strong>{pair.en}</strong>: {pair.mn}</span>
                        <button type="button" onClick={() => handleRemoveFcPair(idx)} className="text-red-400 hover:text-red-650">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TYPE 2: READING EXERCISE BUILDER */}
            {type === 'reading' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 block">Passage Text (Унших эх)</label>
                  <textarea
                    rows={6}
                    placeholder="Унших дасгалын хэсэг үг эсвэл өгүүлбэр, өгүүллэг (English story, article)..."
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs"
                  />
                </div>
                {/* Embedded comprehension helper */}
                {renderSharedCompQuestionsForm()}
              </div>
            )}

            {/* TYPE 3: LISTENING EXERCISE BUILDER */}
            {type === 'listening' && (
              <div className="space-y-4 text-left">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Listening Script (Сонсох эх)</label>
                    <button
                      type="button"
                      onClick={() => handlePlayTTS(ttsScript)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Play size={10} /> Дуудлага урьдчилан сорих (Preview TTS)
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="TTS системээр автоматаар уншигдах Англи хэл дээрх сонсох эхийн өгөгдөл..."
                    value={ttsScript}
                    onChange={(e) => setTtsScript(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs"
                  />
                </div>
                {renderSharedCompQuestionsForm()}
              </div>
            )}

            {/* TYPE 4: SPEAKING PROMPT */}
            {type === 'speaking' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Speaking Prompt Text *</label>
                  <textarea rows={4} placeholder="Ярианы сэдэв эх асуулт..." value={speakingPrompt} onChange={(e) => setSpeakingPrompt(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Example Answer</label>
                  <textarea rows={4} placeholder="Загвар хариултын эх..." value={speakingExample} onChange={(e) => setSpeakingExample(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Key Vocabulary hints (Comma-separated)</label>
                  <textarea rows={4} placeholder="E.g., nature, green energy, preserve" value={speakingHints} onChange={(e) => setSpeakingHints(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs" />
                </div>
              </div>
            )}

            {/* TYPE 5: WRITING TASK */}
            {type === 'writing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Даалгаврын тайлбар (Task description)</label>
                    <textarea rows={4} placeholder="Жишээ: Write an essay about the advantages and disadvantages of online education..." value={writingDescription} onChange={(e) => setWritingDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Агар үгийн тоо (Min word count)</label>
                    <input type="number" value={writingMinCount} onChange={(e) => setWritingMinCount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-center" />
                    
                    <label className="flex items-center gap-2 mt-4 cursor-pointer text-xs font-extrabold text-slate-600">
                      <input type="checkbox" checked={aiFeedbackEnabled} onChange={(e) => setAiFeedbackEnabled(e.target.checked)} className="rounded text-indigo-600 accent-indigo-600" />
                      <span>AI Санал хүсэлт идэвхжүүлэх</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Загвар хариулт (Example answer)</label>
                  <textarea rows={3} placeholder="Загвар оновчтой бичвэрүүд тайлбартай..." value={writingExample} onChange={(e) => setWritingExample(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs" />
                </div>
              </div>
            )}

            {/* TYPE 6: GRAMMAR DRILLS */}
            {type === 'grammar' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1"> Grammar Rule Explanation</label>
                  <textarea rows={3} placeholder="Дүрмийн дүрэм тайлбар жишээ удирдамжууд..." value={grammarExplanation} onChange={(e) => setGrammarExplanation(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs" />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                  <p className="text-xs font-black text-slate-450">Өгүүлбэр нөхөх дасгал бүртгэх (Grammar blanks sentence builder)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Өгүүлбэр: E.g., She ______ (accomplish) her goals yesterday." value={blankSentence} onChange={(e) => setBlankSentence(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-xl text-xs font-bold" />
                    <input type="text" placeholder="Зөв хариулт: E.g., accomplished" value={blankAnswer} onChange={(e) => setBlankAnswer(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-xl text-xs font-bold" />
                  </div>
                  <button type="button" onClick={handleAddGrammarBlank} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black rounded-lg uppercase">
                    + Өгүүлбэр нэмэх
                  </button>
                </div>

                {grammarBlanks.length > 0 && (
                  <div className="border border-slate-150 rounded-xl p-4 space-y-2 text-xs font-bold text-slate-650">
                    {grammarBlanks.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span>{idx + 1}. {b.sentence} (Зөв: <strong className="text-emerald-500">{b.answer}</strong>)</span>
                        <button type="button" onClick={() => handleRemoveGrammarBlank(idx)} className="text-red-400 hover:text-red-650">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TYPE 7: MINI QUIZ */}
            {type === 'quiz' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Тэнцэх хувь (Pass score percentage)</label>
                    <input type="number" value={passPercentage} onChange={(e) => setPassPercentage(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-center" />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-605 mt-4">
                      <input type="checkbox" checked={quizTimerOption} onChange={(e) => setQuizTimerOption(e.target.checked)} className="rounded text-indigo-600 accent-indigo-600" />
                      <span>Сорилын хугацаатай сорил болгох (Active timer)</span>
                    </label>
                  </div>
                </div>
                {renderSharedCompQuestionsForm()}
              </div>
            )}
          </div>

          {/* PRIVILEGES & PUBLISH */}
          <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-8 text-xs font-extrabold text-slate-750">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 accent-indigo-600"
              />
              <span>Pro / Premium Only дасгал болгох (Lock Icon on basic)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 accent-indigo-600"
              />
              <span>Шууд нийтлэх (Published)</span>
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              {editingId ? 'Дасгалыг шинэчлэх' : 'Дасгалыг нийтлэх'}
            </button>
          </div>
        </form>
      </div>

      {/* SKILL LISTS TABLE */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-bold text-slate-600">
          <span>Нийт олдсон: <strong className="text-indigo-600 font-black">{filteredSkills.length} сорил</strong></span>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none"
            >
              <option value="All">Бүх сорилын төрөл</option>
              {SKILL_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label.split('(')[0]}</option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none"
            >
              <option value="All">Бүх түвшнээр</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>
        </div>

        {/* Skill cards list */}
        {loading ? (
          <div className="p-20 text-center bg-white border border-slate-100 rounded-[32px]">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Дасгалуудыг ачааллаж байна...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Тохирох сорил олдсонгүй.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSkills.map(s => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mr-2">
                        {SKILL_TYPES.find(t => t.value === s.type)?.label.split('(')[0] || s.type}
                      </span>
                      <span className="bg-purple-50 text-[#58007E] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        {s.level}
                      </span>
                    </div>

                    <span className="text-[10px] font-black text-indigo-600">
                      {s.xpReward} XP Reward
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-905 mt-2">{s.name}</h4>
                  <p className="text-xs text-slate-450 font-semibold mt-1">Сэдэв: {s.topic}</p>
                  
                  {(s.instructionsMn || s.instructionsEn) && (
                    <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-2 leading-relaxed">
                      "{s.instructionsMn || s.instructionsEn}"
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                  <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider">
                    <span className={s.isPremium ? 'text-amber-500' : 'text-slate-400'}>
                      {s.isPremium ? '★ PREMIUM' : '• FREE'}
                    </span>
                    <span className={s.isPublished ? 'text-emerald-500' : 'text-red-405'}>
                      {s.isPublished ? '• PUBLISHED' : '• DRAFT'}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {/* Duplicate action per specs! */}
                    <button
                      onClick={() => handleDuplicateSkill(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                      title="Duplicate Template"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleEditSkill(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(s)}
                      className="p-1.5 text-slate-450 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Alert Modal */}
        {alertState && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                alertState.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                alertState.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {alertState.type === 'success' ? <Check size={24} /> : 
                 alertState.type === 'error' ? <X size={24} /> : <AlertCircle size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                {alertState.message}
              </p>
              <button
                onClick={() => setAlertState(null)}
                className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black tracking-wider uppercase hover:bg-slate-800 transition-all cursor-pointer"
              >
                Ойлголоо
              </button>
            </div>
          </div>
        )}

        {/* Custom Confirm Modal */}
        {confirmState && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <h4 className="text-base font-black text-slate-900">Баталгаажуулалт</h4>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {confirmState.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
                >
                  Үгүй
                </button>
                <button
                  onClick={() => {
                    confirmState.action();
                    setConfirmState(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
                >
                  Тийм, устгах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Compositions builder form (re-used across reading, listening & quiz templates)
  function renderSharedCompQuestionsForm() {
    return (
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 text-left">
        <p className="text-xs font-black text-slate-500 border-b border-slate-100 pb-2">Comprehension Questions ({comprehensionQuestions.length})</p>
        
        {comprehensionQuestions.length > 0 && (
          <div className="space-y-2">
            {comprehensionQuestions.map((q, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-150 flex justify-between items-center text-xs font-bold text-slate-705">
                <span>{idx + 1}. {q.questionText} (Хариулт: <strong className="text-emerald-500">{q.correctAnswer}</strong>)</span>
                <button type="button" onClick={() => handleRemoveCompQuestion(idx)} className="text-red-400 hover:text-red-650">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input type="text" placeholder="Асуултын бичвэр (Question)..." value={qText} onChange={(e) => setQText(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-xl text-xs font-bold" />
          <input type="text" placeholder="Зөв хариултын текст..." value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-xl text-xs font-bold" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <input type="text" placeholder="Option A" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-lg text-[10px]" />
          <input type="text" placeholder="Option B" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-lg text-[10px]" />
          <input type="text" placeholder="Option C" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-lg text-[10px]" />
          <input type="text" placeholder="Option D" value={qOpt4} onChange={(e) => setQOpt4(e.target.value)} className="bg-white border border-slate-150 p-2 rounded-lg text-[10px]" />
        </div>

        <button
          type="button"
          onClick={handleAddCompQuestion}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-lg uppercase"
        >
          + Асуулт нэмэх
        </button>
      </div>
    );
  }
}

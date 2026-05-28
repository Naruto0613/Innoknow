import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  Check, 
  Loader2, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface Question {
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  questionText: string;
  options: string[]; // up to 4 options for MC
  correctAnswer: string;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  titleMn: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skill: 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'vocabulary' | string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  xpReward: number;
  estimatedTime: number;
  description: string;
  content: {
    introduction: string;
    mainContent: string;
    keyVocabulary: string[]; // array of strings
    questions: Question[];
  };
  isPremium: boolean;
  isPublished: boolean;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

const SKILL_OPTIONS = [
  { value: 'reading', label: '📖 Reading (Унших)' },
  { value: 'listening', label: '🎧 Listening (Сонсох)' },
  { value: 'speaking', label: '🗣️ Speaking (Ярих)' },
  { value: 'writing', label: '✍️ Writing (Бичих)' },
  { value: 'grammar', label: '🔧 Grammar (Дүрэм)' },
  { value: 'vocabulary', label: '📚 Vocabulary (Үгсийн сан)' }
];

export default function LessonManager() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
  const [title, setTitle] = useState('');
  const [titleMn, setTitleMn] = useState('');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  const [skill, setSkill] = useState('reading');
  const [difficulty, setDifficulty] = useState('medium');
  const [xpReward, setXpReward] = useState<number>(20);
  const [estimatedTime, setEstimatedTime] = useState<number>(15);
  const [description, setDescription] = useState('');
  
  // Content JSON Subsections
  const [introduction, setIntroduction] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [keyVocabularyInput, setKeyVocabularyInput] = useState(''); // comma-separated locally

  // Questions Builder Array
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Single Question Adding temporary state
  const [qType, setQType] = useState<'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer'>('multiple-choice');
  const [qText, setQText] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  // Filtering list
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterSkill, setFilterSkill] = useState('All');

  // Preview Modal
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const loadLessons = async () => {
    setLoading(true);
    let loaded: Lesson[] = [];
    try {
      const snap = await getDocs(collection(db, 'lessons'));
      snap.forEach(docSnap => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Lesson);
      });
      localStorage.setItem('innoknow_lessons_admin_backup', JSON.stringify(loaded));
    } catch (e) {
      console.warn("Error reading lessons from Firestore, loading backup:", e);
      try {
        const cached = localStorage.getItem('innoknow_lessons_admin_backup');
        if (cached) loaded = JSON.parse(cached);
      } catch (innerErr) {}
    }
    // Sort newly created lessons first
    loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setLessons(loaded);
    setLoading(false);
  };

  useEffect(() => {
    loadLessons();
  }, []);

  // Premium toggle state
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Clean form
  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setTitleMn('');
    setLevel('A1');
    setSkill('reading');
    setDifficulty('medium');
    setXpReward(20);
    setEstimatedTime(15);
    setDescription('');
    setIntroduction('');
    setMainContent('');
    setKeyVocabularyInput('');
    setQuestions([]);
    resetQuestionBuilder();
  };

  const resetQuestionBuilder = () => {
    setQText('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setQCorrect('');
    setQExplanation('');
    setQType('multiple-choice');
  };

  // Add question to temporary collection
  const handleAddQuestion = () => {
    if (!qText.trim()) {
      alert('Асуултын текстийг бичнэ үү.');
      return;
    }
    if (!qCorrect.trim()) {
      alert('Зөв хариултыг заавал бөглөнө үү.');
      return;
    }

    const newQ: Question = {
      type: qType,
      questionText: qText.trim(),
      options: qType === 'multiple-choice' ? [qOpt1.trim(), qOpt2.trim(), qOpt3.trim(), qOpt4.trim()].filter(Boolean) : [],
      correctAnswer: qCorrect.trim(),
      explanation: qExplanation.trim()
    };

    setQuestions([...questions, newQ]);
    resetQuestionBuilder();
  };

  // Remove question from temp list
  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Submit / Write to database
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !titleMn.trim()) {
      alert('Хичээлийн гарчгийг хоёр хэл дээр бүрэн бөглөнө үү.');
      return;
    }

    setSaving(true);
    const lessonId = editingId || 'lesson_' + Date.now();
    const vocabArray = keyVocabularyInput
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      titleMn: titleMn.trim(),
      level,
      skill,
      difficulty,
      xpReward: Number(xpReward) || 20,
      estimatedTime: Number(estimatedTime) || 15,
      description: description.trim(),
      content: {
        introduction: introduction.trim(),
        mainContent: mainContent.trim(),
        keyVocabulary: vocabArray,
        questions: questions
      },
      isPremium,
      isPublished,
      addedBy: user?.uid || 'admin',
      createdAt: editingId ? (lessons.find(l => l.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'lessons', lessonId), payload);
      alert(editingId ? 'Хичээлийг амжилттай шинэчиллээ!' : 'Хичээлийг амжилттай бүртгэж нийтэллээ!');
      clearForm();
      loadLessons();
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `lessons/${lessonId}`);
      } catch (jsonErr: any) {
        alert(`Алдаа гарлаа: ${jsonErr.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill Edit
  const handleEditLesson = (l: Lesson) => {
    setEditingId(l.id);
    setTitle(l.title);
    setTitleMn(l.titleMn);
    setLevel(l.level);
    setSkill(l.skill);
    setDifficulty(l.difficulty);
    setXpReward(l.xpReward);
    setEstimatedTime(l.estimatedTime);
    setDescription(l.description || '');
    
    // Content JSON checks
    setIntroduction(l.content?.introduction || '');
    setMainContent(l.content?.mainContent || '');
    setKeyVocabularyInput(l.content?.keyVocabulary?.join(', ') || '');
    setQuestions(l.content?.questions || []);
    setIsPremium(!!l.isPremium);
    setIsPublished(!!l.isPublished);

    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Toggle publish immediately
  const handleTogglePublish = async (l: Lesson) => {
    try {
      const docRef = doc(db, 'lessons', l.id);
      await updateDoc(docRef, { isPublished: !l.isPublished });
      // update state locally too
      setLessons(prev => prev.map(item => item.id === l.id ? { ...item, isPublished: !item.isPublished } : item));
    } catch (err) {
      console.error("Failed toggling publish:", err);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (l: Lesson) => {
    showConfirm(`"${l.title}" хичээлийг устгах уу?`, async () => {
      try {
        await deleteDoc(doc(db, 'lessons', l.id));
        showAlert('Амжилттай устгагдлаа.', 'success');
        loadLessons();
      } catch (err) {
        console.error(err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `lessons/${l.id}`);
        } catch (jsonErr: any) {
          showAlert(`Алдаа гарлаа: ${jsonErr.message}`, 'error');
        }
      }
    });
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchLvl = filterLevel === 'All' || l.level === filterLevel;
      const matchSkill = filterSkill === 'All' || l.skill === filterSkill;
      return matchLvl && matchSkill;
    });
  }, [lessons, filterLevel, filterSkill]);

  return (
    <div className="space-y-8">
      {/* Lesson Manager Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#58007E]">
            <BookOpen size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-905">Хичээлийн удирдлагын хэсэг</h4>
            <p className="text-xs text-slate-400 font-semibold">Англи хэлний түвшин бүрийн сургалтын агуулга, тест сорилууд</p>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Нийт: <strong className="text-[#58007E] font-black">{lessons.length} хичээл</strong> бүртгэгдсэн байна.
        </div>
      </div>

      {/* CREATE & EDIT FORM */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plus className="text-indigo-600" />
            {editingId ? 'Хичээлийн гар болон агуулга засах' : 'Шинэ Хичээл нийтлэх бүртгэлийн карт'}
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

        <form onSubmit={handleSaveLesson} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Хичээлийн нэр (English Title) *</label>
              <input 
                type="text"
                placeholder="Жишээ: Present Perfect Tense In Use"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Хичээлийн нэр (Монгол орчуулга) *</label>
              <input 
                type="text"
                placeholder="Жишээ: Одоо төгссөн цагийг амьдралд хэрэглэх"
                value={titleMn}
                onChange={(e) => setTitleMn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Сонгох түвшин (CEFR)</label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white"
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
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Багц ур чадвар (Skill)</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white"
              >
                {SKILL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Хүндрэл (Difficulty)</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white"
              >
                <option value="easy">Easy (Амархан)</option>
                <option value="medium">Medium (Дундаж)</option>
                <option value="hard">Hard (Хэцүү)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Олгох XP</label>
                <input 
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-center outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Хугацаа (мин)</label>
                <input 
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-center outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Хичээлийн товч тайлбар (Brief Description)</label>
            <textarea
              rows={2}
              placeholder="Хичээлийн суралцах зорилго болон уг агуулгаар юу заах тухай товч тайлбар заавар..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* RICH CONTENT SECTIONS */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <h4 className="text-xs font-black text-[#58007E] uppercase tracking-widest">Хичээлийн үндсэн агуулга засах хэсэг</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">1. Оршил хэсгийн бичвэр (Introduction Text)</label>
                <textarea
                  rows={4}
                  placeholder="Хичээл эхлэх үед хэрэглэгчид сурах зүйлийг дулаацуулах оршил бичвэр уриалгууд..."
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  className="w-full font-sans text-xs bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-505"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">2. Гол агуулга & Дүрмийн жишээ (Main Lesson Content with HTML support)</label>
                <textarea
                  rows={4}
                  placeholder="Бүтэц, дүрмийн тайлбарууд, жишээ харилцан ярианууд..."
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  className="w-full font-sans text-xs bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-505"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Түлхүүр үгс (Key Vocabulary used under the check - Comma-separated list)</label>
              <input 
                type="text"
                placeholder="Жишээ: accomplish, innovate, dynamic, focus"
                value={keyVocabularyInput}
                onChange={(e) => setKeyVocabularyInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-505 outline-none"
              />
            </div>
          </div>

          {/* QUESTIONS REAL-TIME BUILDER */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-[#58007E] uppercase tracking-widest">Тест Сорилын сан (Questions: {questions.length})</h4>
              {questions.length < 3 && (
                <span className="text-[10px] text-amber-500 font-extrabold">Хагас сорил бэлтгэхийн тулд хамгийн багадаа 3+ асуулт нэмнэ үү!</span>
              )}
            </div>

            {/* Questions list display */}
            {questions.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-2.5">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-150 flex items-center justify-between font-bold text-xs text-slate-700">
                    <div className="space-y-0.5">
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider mr-2">{q.type}</span>
                      <strong className="text-slate-900">{idx + 1}. {q.questionText}</strong>
                      <p className="text-[10px] text-slate-400 font-medium">Зөв хариулт: <strong className="text-emerald-500">{q.correctAnswer}</strong> • Тайлбар: {q.explanation}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Questions adding forms */}
            <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-4">
              <span className="text-xs font-extrabold text-slate-650 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-indigo-600" /> Шинэ асуулт нэмэх хэсэг:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 block">Асуултын төрөл (Type)</label>
                  <select
                    value={qType}
                    onChange={(e: any) => setQType(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="multiple-choice">Олон сонголтот (Multiple Choice)</option>
                    <option value="true-false">Зөв/Буруу (True-False)</option>
                    <option value="fill-blank">Нөхөх дасгал (Fill in the blank)</option>
                    <option value="short-answer">Богино хариулт (Short answer)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 block">Асуултын бичвэр (Question text) *</label>
                  <input 
                    type="text"
                    placeholder="Жишээ: What is the correct translation of 'Accomplish'?"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {qType === 'multiple-choice' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Сонголт A</label>
                    <input type="text" placeholder="Сонголт A" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[11px]" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Сонголт B</label>
                    <input type="text" placeholder="Сонголт B" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[11px]" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Сонголт C</label>
                    <input type="text" placeholder="Сонголт C" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[11px]" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Сонголт D</label>
                    <input type="text" placeholder="Сонголт D" value={qOpt4} onChange={(e) => setQOpt4(e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[11px]" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 block">Зөв хариултын текст * (MC бол сонгосон үгийн өөр хариулт таарна)</label>
                  {qType === 'true-false' ? (
                    <select
                      value={qCorrect}
                      onChange={(e) => setQCorrect(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-650"
                    >
                      <option value="">Төлөв сонгох</option>
                      <option value="True">True (Зөв)</option>
                      <option value="False">False (Буруу)</option>
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Жишээ: True, эсвэл харгалзах зөв бичвэрүүд"
                      value={qCorrect}
                      onChange={(e) => setQCorrect(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs text-emerald-600 font-extrabold"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 block">Зөв хариултын тайлбар (Explanation)</label>
                  <input 
                    type="text"
                    placeholder="Жишээ: 'Accomplish' means to complete things successfully."
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  + Асуултын санд нэмэх
                </button>
              </div>
            </div>
          </div>

          {/* IS PREMIUM & PUBLISH TOGGLES */}
          <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-8 text-xs font-extrabold text-slate-750">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 accent-indigo-600"
              />
              <span>Pro / Premium Only хичээл болгох (LOCK)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 accent-indigo-600"
              />
              <span>Шууд нийтлэх төлөвтэй хадгалах (Publish Lesson)</span>
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-[#58007E] hover:bg-[#40005e] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              {editingId ? 'Хичээлийг шинэчлэх' : 'Хичээлийг архивлан хадгалах'}
            </button>
          </div>
        </form>
      </div>

      {/* FILTER & LISTING TABLE */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-bold text-slate-600">
          <span>Нийт олдсон: <strong className="text-[#58007E] font-black">{filteredLessons.length} хичээл</strong></span>
          
          <div className="flex gap-3">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:bg-white"
            >
              <option value="All">Бүх түвшнээр шүүх</option>
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Upper-Intermediate</option>
              <option value="C1">C1 Advanced</option>
              <option value="C2">C2 Mastery</option>
            </select>

            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:bg-white"
            >
              <option value="All">Бүх ур чадвараар</option>
              {SKILL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lessons List table */}
        {loading ? (
          <div className="p-20 text-center bg-white border border-slate-100 rounded-[32px]">
            <Loader2 className="w-10 h-10 animate-spin text-[#58007E] mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Хичээлүүдийг ачааллаж байна...</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Тохирох хичээл олдсонгүй.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="p-5">Гарчиг (Хос хэл дээр)</th>
                    <th className="p-5 text-center">Түвшин</th>
                    <th className="p-5">Ур чадвар / Төрөл</th>
                    <th className="p-5 text-center">XP</th>
                    <th className="p-5 text-center">Хүү / Premium</th>
                    <th className="p-5 text-center">Нийтэлсэн</th>
                    <th className="p-5 text-right font-extrabold">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-705">
                  {filteredLessons.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-5">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 leading-tight">{l.title}</p>
                          <p className="text-slate-400 font-bold leading-tight text-[11px]">{l.titleMn}</p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="px-2.5 py-1 text-[10px] bg-slate-100 text-slate-650 rounded-lg">
                          {l.level}
                        </span>
                      </td>
                      <td className="p-5 uppercase text-[10px] text-zinc-550 font-black tracking-widest">
                        {l.skill}
                      </td>
                      <td className="p-5 text-center text-[#58007E] font-black">
                        {l.xpReward} XP
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${l.isPremium ? 'bg-amber-100 text-amber-700 border-amber-200 border' : 'bg-slate-100 text-slate-500'}`}>
                          {l.isPremium ? 'PRO ONLY' : 'БҮГД'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleTogglePublish(l)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${l.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-505 border-rose-100'}`}
                        >
                          {l.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </button>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button
                          onClick={() => setPreviewLesson(l)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                          title="Харах"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditLesson(l)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                          title="Засах"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(l)}
                          className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Устгах"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* LESSON PREVIEW PANEL INTERACTIVE PREVIEW MODAL */}
      {previewLesson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-indigo-505/20 text-indigo-300 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                  {previewLesson.level} • {previewLesson.skill.toUpperCase()}
                </span>
                <h4 className="text-lg font-black tracking-tight mt-1">{previewLesson.title}</h4>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm font-semibold text-slate-700 leading-relaxed text-left">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Монгол гарчиг</p>
                <p className="text-sm font-black text-slate-900">{previewLesson.titleMn}</p>
              </div>

              {previewLesson.content?.introduction && (
                <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">1. Оршил хэсгийн бичвэр</p>
                  <p className="text-slate-800 italic">"{previewLesson.content.introduction}"</p>
                </div>
              )}

              {previewLesson.content?.mainContent && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Үндсэн дүрмийн хэсэг / Бичвэр</p>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl whitespace-pre-wrap font-medium text-slate-800 text-xs leading-relaxed">
                    {previewLesson.content.mainContent}
                  </div>
                </div>
              )}

              {previewLesson.content?.keyVocabulary && previewLesson.content.keyVocabulary.length > 0 && (
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Хичээлд хэрэглэгдэх түлхүүр үгс</p>
                  <div className="flex flex-wrap gap-2">
                    {previewLesson.content.keyVocabulary.map(v => (
                      <span key={v} className="bg-purple-50 text-[#58007E] border border-purple-100 rounded-lg px-2.5 py-1 text-xs">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewLesson.content?.questions && previewLesson.content.questions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-black text-slate-950 uppercase tracking-wider">Уг хичээл дээрх дасгал асуултууд ({previewLesson.content.questions.length})</h5>
                  
                  <div className="space-y-4 divide-y divide-slate-100">
                    {previewLesson.content.questions.map((q, idx) => (
                      <div key={idx} className="pt-3 space-y-2 text-xs">
                        <p className="font-extrabold text-[#58007E]">Асуулт {idx + 1}: <span className="text-slate-900">{q.questionText}</span></p>
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pl-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="bg-slate-50 p-2 rounded border border-slate-100 text-slate-700">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="pl-4 text-[11px] text-emerald-600 font-black">Зөв хариулт: {q.correctAnswer}</p>
                        {q.explanation && (
                          <p className="pl-4 text-[10px] text-slate-400 italic font-medium">Тайлбар: {q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewLesson(null)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
              >
                Хаах
              </button>
            </div>
          </div>
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
  );
}

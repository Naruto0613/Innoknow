import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  X, 
  Check, 
  Loader2, 
  FileJson,
  AlertCircle
} from 'lucide-react';

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  pos: 'noun' | 'verb' | 'adj' | 'adv';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  example: string;
  exampleMn: string;
  addedBy: string;
  addedAt: string;
}

const CATEGORIES = [
  'Daily life',
  'Academic/School words',
  'Business/Work words',
  'Travel words',
  'Health/Body words',
  'Technology words',
  'Nature/Environment',
  'Emotions/Feelings'
];

const LEVEL_COLORS = {
  A1: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  A2: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  B1: 'bg-amber-50 text-amber-600 border-amber-100',
  B2: 'bg-amber-50 text-amber-600 border-amber-100',
  C1: 'bg-red-50 text-red-600 border-red-100',
  C2: 'bg-red-50 text-red-600 border-red-100'
};

export default function VocabularyManager() {
  const { user } = useAuth();
  const [words, setWords] = useState<VocabularyWord[]>([]);
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

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [pos, setPos] = useState<'noun' | 'verb' | 'adj' | 'adv'>('noun');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [example, setExample] = useState('');
  const [exampleMn, setExampleMn] = useState('');

  // Filtering & Search
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Multi-select / Bulk Delete
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());

  // JSON Import States
  const [importOpen, setImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Load words from Firestore with LocalStorage backup
  const loadWords = async () => {
    setLoading(true);
    let firestoreWords: VocabularyWord[] = [];
    try {
      const snap = await getDocs(collection(db, 'vocabulary'));
      snap.forEach(docSnap => {
        firestoreWords.push({ id: docSnap.id, ...docSnap.data() } as VocabularyWord);
      });
      
      // Save backup locally
      localStorage.setItem('innoknow_admin_vocab_backup', JSON.stringify(firestoreWords));
    } catch (err) {
      console.warn("Failed fetching vocabulary from Firestore, loading local backup:", err);
      try {
        const cached = localStorage.getItem('innoknow_admin_vocab_backup');
        if (cached) firestoreWords = JSON.parse(cached);
      } catch (innerErr) {
        console.error("Cache parsing error:", innerErr);
      }
    }
    setWords(firestoreWords);
    setLoading(false);
  };

  useEffect(() => {
    loadWords();
  }, []);

  // Save / Add word
  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) {
      showAlert('Англи үг болон орчуулгыг бүрэн бөглөнө үү.', 'info');
      return;
    }

    setSaving(true);
    const wordId = editingId || 'word_' + Date.now();
    const payload = {
      word: word.trim(),
      translation: translation.trim(),
      pos,
      level,
      category,
      example: example.trim(),
      exampleMn: exampleMn.trim(),
      addedBy: user?.uid || 'admin',
      addedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'vocabulary', wordId), payload);
      showAlert(editingId ? 'Үгийг амжилттай шинэчиллээ!' : 'Шинэ үг амжилттай нэмэгдлээ!', 'success');
      
      // Clear form
      clearForm();
      loadWords();
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `vocabulary/${wordId}`);
      } catch (jsonErr: any) {
        showAlert(`Алдаа гарлаа: ${jsonErr.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill form for edit
  const handleEdit = (w: VocabularyWord) => {
    setEditingId(w.id);
    setWord(w.word);
    setTranslation(w.translation);
    setPos(w.pos);
    setLevel(w.level);
    setCategory(w.category);
    setExample(w.example || '');
    setExampleMn(w.exampleMn || '');
    // Scroll to form smoothly
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Delete word
  const handleDelete = async (id: string, name: string) => {
    showConfirm(`"${name}" үгийг устгахдаа итгэлтэй байна уу?`, async () => {
      try {
        await deleteDoc(doc(db, 'vocabulary', id));
        showAlert('Үг амжилттай устгагдлаа.', 'success');
        loadWords();
      } catch (err) {
        console.error(err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `vocabulary/${id}`);
        } catch (jsonErr: any) {
          showAlert(`Алдаа гарлаа: ${jsonErr.message}`, 'error');
        }
      }
    });
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedWordIds.size === 0) return;
    showConfirm(`Сонгосон ${selectedWordIds.size} үгийг нэгмөсөн устгах уу?`, async () => {
      setSaving(true);
      try {
        const batch = writeBatch(db);
        selectedWordIds.forEach(id => {
          batch.delete(doc(db, 'vocabulary', id));
        });
        await batch.commit();
        showAlert('Сонгосон үгс амжилттай устгагдлаа.', 'success');
        setSelectedWordIds(new Set());
        loadWords();
      } catch (err) {
        console.error("Bulk delete error:", err);
        showAlert('Бөөнөөр устгахад алдаа гарлаа.', 'error');
      } finally {
        setSaving(false);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedWordIds.size === filteredWords.length) {
      setSelectedWordIds(new Set());
    } else {
      setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
    }
  };

  const toggleSelectWord = (id: string) => {
    const next = new Set(selectedWordIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedWordIds(next);
  };

  const clearForm = () => {
    setEditingId(null);
    setWord('');
    setTranslation('');
    setPos('noun');
    setLevel('A1');
    setCategory(CATEGORIES[0]);
    setExample('');
    setExampleMn('');
  };

  // Parse pasted JSON & Preview
  const handleJsonChange = (val: string) => {
    setJsonInput(val);
    if (!val.trim()) {
      setImportPreview([]);
      setImportError(null);
      return;
    }

    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        throw new Error('Оруулсан өгөгдөл нь массив (JSON Array of objects) байх ёстой.');
      }
      
      // Validate schema minimally
      const validated = parsed.map((item, idx) => {
        if (!item.word || !item.translation) {
          throw new Error(`#${idx + 1} мөрөнд "word" эсвэл "translation" талбар дутуу байна.`);
        }
        return {
          word: String(item.word),
          translation: String(item.translation),
          pos: item.pos || 'noun',
          level: item.level || 'A1',
          category: item.category || CATEGORIES[0],
          example: item.example || '',
          exampleMn: item.exampleMn || ''
        };
      });

      setImportPreview(validated);
      setImportError(null);
    } catch (e: any) {
      setImportError(e.message || 'JSON хэлбэр буруу байна.');
      setImportPreview([]);
    }
  };

  // Submit Mass JSON Import skipping duplicates
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setSaving(true);
    
    // Existing list to avoid duplicates (case insensitive matching)
    const existingWordsSet = new Set(words.map(w => w.word.toLowerCase().trim()));
    let skippedCount = 0;
    let importCount = 0;

    try {
      const batchLimit = 500;
      let batch = writeBatch(db);
      let countInBatch = 0;

      for (const item of importPreview) {
        const itemKey = item.word.toLowerCase().trim();
        if (existingWordsSet.has(itemKey)) {
          skippedCount++;
          continue;
        }

        const generatedId = 'word_import_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        const docRef = doc(db, 'vocabulary', generatedId);
        
        batch.set(docRef, {
          ...item,
          addedBy: user?.uid || 'admin',
          addedAt: new Date().toISOString()
        });
        
        countInBatch++;
        importCount++;

        if (countInBatch >= batchLimit) {
          await batch.commit();
          batch = writeBatch(db);
          countInBatch = 0;
        }
      }

      if (countInBatch > 0) {
        await batch.commit();
      }

      showAlert(`Амжилттай импортлогдлоо! Нэмэгдсэн: ${importCount}, Алгассан (давхардсан): ${skippedCount}`, 'success');
      setImportOpen(false);
      setJsonInput('');
      setImportPreview([]);
      loadWords();
    } catch (err) {
      console.error("Mass import failed:", err);
      showAlert('Үгсийг импортлоход алдаа гарлаа.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered lists
  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchSearch = w.word.toLowerCase().includes(search.toLowerCase()) || 
                          w.translation.toLowerCase().includes(search.toLowerCase());
      const matchLvl = selectedLevel === 'All' || w.level === selectedLevel;
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      return matchSearch && matchLvl && matchCat;
    });
  }, [words, search, selectedLevel, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Нийт нэмэгдсэн үг</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{words.length} <span className="text-sm font-semibold text-slate-500">үг</span></p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Download size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Шүүлтүүрт олдсон</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{filteredWords.length} <span className="text-sm font-semibold text-slate-500">үг</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Импортлох боломж</p>
            <button
              onClick={() => setImportOpen(true)}
              className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all"
            >
              <FileJson size={14} /> JSON-оос импорт хийх
            </button>
          </div>
        </div>
      </div>

      {/* Add New Word Form Card */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plus className="text-indigo-600" />
            {editingId ? 'Үг засах хэсэг' : 'Шинэ үг нэмэх бүртгэл'}
          </h3>
          {editingId && (
            <button
              onClick={clearForm}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} /> Цуцлах
            </button>
          )}
        </div>

        <form onSubmit={handleSaveWord} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Англи үг (English Word) *</label>
              <input 
                type="text"
                placeholder="Жишээ: Accomplish"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Монгол орчуулга (Mongolian translation) *</label>
              <input 
                type="text"
                placeholder="Жишээ: Хэрэгжүүлэх, гүйцэтгэх"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Ярианы хэсэг (Part of Speech)</label>
              <select
                value={pos}
                onChange={(e: any) => setPos(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="noun">Noun (Нэр үг)</option>
                <option value="verb">Verb (Үйл үг)</option>
                <option value="adj">Adjective (Тэмдэг үг)</option>
                <option value="adv">Adverb (Дайвар үг)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Түвшин (CEFR Level)</label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper-Intermediate)</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="C2">C2 (Mastery)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Ангилал (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Жишээ өгүүлбэр (Англи)</label>
              <input 
                type="text"
                placeholder="Жишээ: We can accomplish anything if we work together."
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Жишээ орчуулга (Монгол)</label>
              <input 
                type="text"
                placeholder="Жишээ: Бид хамтран ажиллавал юуг ч биелүүлэх боломжтой."
                value={exampleMn}
                onChange={(e) => setExampleMn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              {editingId ? 'Өөрчлөлтийг хадгалах' : 'Үг нэмэх'}
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH, FILTER AND WORD LIST GRID */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Шүүх үг эсвэл орчуулга..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-505"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">Бүх түвшин</option>
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Upper-Intermediate</option>
              <option value="C1">C1 Advanced</option>
              <option value="C2">C2 Mastery</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">Бүх ангилал</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BULK ACTIONS BANNER */}
        {selectedWordIds.size > 0 && (
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg text-xs font-bold">
            <span>Сонгосон: <strong className="text-indigo-400">{selectedWordIds.size} үг</strong></span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-extrabold text-white flex items-center gap-1 transition-all"
            >
              <Trash2 size={12} /> Сонгосныг Бөөнөөр Устгах ({selectedWordIds.size})
            </button>
          </div>
        )}

        {/* Word Table/Cards List */}
        {loading ? (
          <div className="p-20 text-center bg-white border border-slate-100 rounded-[32px]">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Үгийн санг ачааллаж байна...</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Тохирох үг олдсонгүй.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedWordIds.size === filteredWords.length && filteredWords.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded accent-indigo-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Үг (Англи)</th>
                    <th className="p-4">Орчуулга (Монгол)</th>
                    <th className="p-4">Ярианы хэсэг</th>
                    <th className="p-4">Багц / Ангилал</th>
                    <th className="p-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredWords.map(w => {
                    const isChecked = selectedWordIds.has(w.id);
                    return (
                      <tr key={w.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectWord(w.id)}
                            className="rounded accent-indigo-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{w.word}</span>
                            <span className={`px-2 py-0.5 border text-[9px] font-black rounded ${LEVEL_COLORS[w.level] || ''}`}>
                              {w.level}
                            </span>
                          </div>
                          {w.example && (
                            <p className="text-slate-400 italic font-medium max-w-xs truncate text-[10px] mt-1">"{w.example}"</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-slate-900">{w.translation}</span>
                          {w.exampleMn && (
                            <p className="text-slate-400 font-medium max-w-xs truncate text-[10px] mt-1">"{w.exampleMn}"</p>
                          )}
                        </td>
                        <td className="p-4 uppercase text-slate-500 font-black tracking-wider text-[9px]">
                          {w.pos}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px]">
                            {w.category}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(w)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Засах"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(w.id, w.word)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Устгах"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* JSON IMPORT PANEL MODAL */}
      {importOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h4 className="text-lg font-black tracking-tight">Paste JSON Array of Words</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Bulk uploads for words database</p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-450 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-xs leading-relaxed font-semibold">
                🔔 <strong>Зөвлөмж:</strong> Та дараах хэлбэртэй JSON өгөгдөл оруулснаар олон зуун үгийг нэг дор хурдан системд оруулах боломжтой. Давхардсан англи үгсийг автоматаар шүүж бүртгэхгүй алгасах болно.
              </div>

              <details className="text-xs bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-pointer">
                <summary className="font-extrabold text-slate-700">JSON Бүтэц харах (Энд дарна уу)</summary>
                <pre className="text-[10px] font-mono mt-2 bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`[
  {
    "word": "Innovate",
    "translation": "Шинэчлэх, шинэлэг зүйл хийх",
    "pos": "verb",
    "level": "B2",
    "category": "Technology words",
    "example": "To survive in the market, companies must innovate.",
    "exampleMn": "Зах зээлд оршин тогтнохын тулд компаниуд шинэлэг байх ёстой."
  }
]`}
                </pre>
              </details>

              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">JSON өгөгдөл хуулж тавих (Pasted JSON)</label>
                <textarea
                  rows={8}
                  placeholder='[ { "word": "Example", "translation": "Жишээ"... } ]'
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-100 rounded-xl p-3 focus:bg-white focus:border-indigo-500 outline-none transition-all leading-normal"
                />
              </div>

              {importError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}

              {importPreview.length > 0 && (
                <div>
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Импортлох үгсийн урьдчилан харах ({importPreview.length} үг)</h5>
                  <div className="border border-slate-100 rounded-xl max-h-40 overflow-y-auto text-xs divide-y divide-slate-100 bg-slate-50/50">
                    {importPreview.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center font-bold text-slate-700">
                        <span><strong>{item.word}</strong> - {item.translation}</span>
                        <span className="text-[10px] uppercase font-black text-slate-400">{item.level} | {item.pos}</span>
                      </div>
                    ))}
                    {importPreview.length > 10 && (
                      <div className="p-3 text-center text-[10px] text-slate-400 font-extrabold">... болон бусад {importPreview.length - 10} үгс</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setImportOpen(false)}
                className="px-4 py-2 bg-white border border-slate-250 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                Хаах
              </button>
              <button
                disabled={saving || importPreview.length === 0}
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Амжилттай оруулах ({importPreview.length})
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
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-705 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
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

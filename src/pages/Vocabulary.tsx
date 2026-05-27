import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { getVocabularyWords, VocabularyWord } from "../data/vocabularyData";
import {
  Search,
  Brain,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Volume2,
  Check,
  Filter,
  Layers,
  Trophy,
  Clock,
} from "lucide-react";

export default function Vocabulary() {
  const { user, profile, updateProfile } = useAuth();

  // Loading all 500+ words
  const allWords = useMemo(() => getVocabularyWords(), []);

  // State
  const [activeTab, setActiveTab] = useState<"all" | "learned">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPos, setSelectedPos] = useState<string>("All");

  // Flashcard practice states
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [practicePool, setPracticePool] = useState<VocabularyWord[]>([]);

  // Local state for non-logged in users learned words
  const [localLearnedWords, setLocalLearnedWords] = useState<
    { wordId: string; dateLearned: string }[]
  >(() => {
    try {
      const stored = localStorage.getItem("innoknow_guest_learned_words");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Get effective learned words
  const learnedWordsList = useMemo(() => {
    if (user && profile) {
      return profile.learnedWords || [];
    }
    return localLearnedWords;
  }, [user, profile, localLearnedWords]);

  // Learned words set for O(1) lookups
  const learnedSet = useMemo(() => {
    return new Set(learnedWordsList.map((item: any) => item.wordId));
  }, [learnedWordsList]);

  // Handle learning / toggling word
  const toggleLearned = async (word: VocabularyWord) => {
    const isLearned = learnedSet.has(word.id);
    let updatedList;

    if (isLearned) {
      updatedList = learnedWordsList.filter(
        (item: any) => item.wordId !== word.id,
      );
    } else {
      updatedList = [
        ...learnedWordsList,
        { wordId: word.id, dateLearned: new Date().toISOString() },
      ];
    }

    if (user && profile) {
      try {
        await updateProfile({ learnedWords: updatedList });
      } catch (err) {
        console.error("Failed to update learned words:", err);
      }
    } else {
      localStorage.setItem(
        "innoknow_guest_learned_words",
        JSON.stringify(updatedList),
      );
      setLocalLearnedWords(updatedList);
    }
  };

  // Map learnedWord records to the full Vocabulary Word details
  const mappedLearnedDetailed = useMemo(() => {
    const recordsMap = new Map(
      learnedWordsList.map((item: any) => [item.wordId, item.dateLearned]),
    );
    return (
      allWords
        .filter((w) => recordsMap.has(w.id))
        .map((w) => ({
          ...w,
          dateLearned: recordsMap.get(w.id) || "",
        }))
        // Sort: newly learned words first
        .sort(
          (a, b) =>
            new Date(b.dateLearned).getTime() -
            new Date(a.dateLearned).getTime(),
        )
    );
  }, [allWords, learnedWordsList]);

  // Text filters & query execution
  const activeWordList = activeTab === "all" ? allWords : mappedLearnedDetailed;

  const filteredWords = useMemo(() => {
    return activeWordList.filter((w) => {
      const matchesSearch =
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === "All" || w.level === selectedLevel;
      const matchesCategory =
        selectedCategory === "All" || w.category === selectedCategory;
      const matchesPos = selectedPos === "All" || w.pos === selectedPos;

      return matchesSearch && matchesLevel && matchesCategory && matchesPos;
    });
  }, [
    activeWordList,
    searchTerm,
    selectedLevel,
    selectedCategory,
    selectedPos,
  ]);

  // Speech helper
  const speakWord = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start flashcard session with learned words
  const startPractice = () => {
    if (mappedLearnedDetailed.length === 0) return;
    // Shuffle practice pool
    const shuffled = [...mappedLearnedDetailed].sort(() => 0.5 - Math.random());
    setPracticePool(shuffled);
    setCurrentFlashcardIdx(0);
    setIsFlipped(false);
    setSessionScore({ correct: 0, total: shuffled.length });
    setPracticeFinished(false);
    setFlashcardMode(true);
  };

  const handleFlashcardAnswer = (known: boolean) => {
    if (known) {
      setSessionScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentFlashcardIdx < practicePool.length - 1) {
        setCurrentFlashcardIdx((prev) => prev + 1);
      } else {
        setPracticeFinished(true);
        // award XP on completion!
        if (user && profile) {
          const currentXp = profile.xp || 450;
          const additionalXp = known ? 15 : 10; // gain XP per study session
          updateProfile({ xp: currentXp + additionalXp });
        }
      }
    }, 200);
  };

  // Categories list
  const categoryOptions = [
    "All",
    "Daily life",
    "Academic/School words",
    "Business/Work words",
    "Travel words",
    "Health/Body words",
    "Technology words",
    "Nature/Environment",
    "Emotions/Feelings",
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!flashcardMode ? (
            <motion.div
              key="list-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Header section */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white border border-zinc-100 rounded-5xl p-8 shadow-sm">
                <div>
                  <h1 className="text-5xl font-black italic font-serif text-zinc-900 tracking-tight mb-2">
                    Word Library
                  </h1>
                  <p className="text-zinc-500 font-medium tracking-tight">
                    Study and master over{" "}
                    <span className="text-[#58007E] font-black">500+</span>{" "}
                    essential English words in 8 key categories.
                  </p>
                </div>
                {mappedLearnedDetailed.length > 0 && (
                  <button
                    onClick={startPractice}
                    className="bg-[#58007E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#40005C] transition-all flex items-center gap-3 shadow-xl shadow-[#58007E]/20"
                  >
                    <Brain size={18} /> Practice {mappedLearnedDetailed.length}{" "}
                    Flashcards
                  </button>
                )}
              </header>

              {/* Counts & Progress Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Total Library
                  </p>
                  <p className="text-3xl font-black text-zinc-950">
                    {allWords.length} words
                  </p>
                </div>
                <div className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Learned Words
                  </p>
                  <p className="text-3xl font-black text-emerald-500">
                    {mappedLearnedDetailed.length} learned
                  </p>
                </div>
                <div className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    Active Study Level
                  </p>
                  <p className="text-2xl font-black text-[#58007E] uppercase">
                    {profile?.level || "A1"}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                    XP Multiplier
                  </p>
                  <p className="text-3xl font-black text-amber-500">
                    {profile?.xp || 450} XP
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-zinc-100 pb-px">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === "all" ? "border-[#58007E] text-[#58007E]" : "border-transparent text-zinc-450 hover:text-zinc-800"}`}
                >
                  All Words ({allWords.length})
                </button>
                <button
                  onClick={() => setActiveTab("learned")}
                  className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer relative ${activeTab === "learned" ? "border-[#58007E] text-[#58007E]" : "border-transparent text-zinc-450 hover:text-zinc-800"}`}
                >
                  My Words ({mappedLearnedDetailed.length})
                  {mappedLearnedDetailed.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-5 h-5 rounded-full text-[8px] flex items-center justify-center bg-emerald-500 text-white font-bold">
                      {mappedLearnedDetailed.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filters Panel */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="relative">
                  <Search
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by English term or Mongolian translation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 border border-transparent focus:border-zinc-100 focus:bg-white rounded-3xl py-4.5 pl-16 pr-8 text-sm font-bold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                      Category Filter
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-zinc-700 outline-none focus:bg-white"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                      Level (CEFR)
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-zinc-700 outline-none focus:bg-white"
                    >
                      <option value="All">All Levels</option>
                      <option value="A1">A1 Beginner</option>
                      <option value="A2">A2 Elementary</option>
                      <option value="B1">B1 Intermediate</option>
                      <option value="B2">B2 Upper Intermediate</option>
                      <option value="C1">C1 Advanced</option>
                      <option value="C2">C2 Mastery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">
                      Part of Speech
                    </label>
                    <select
                      value={selectedPos}
                      onChange={(e) => setSelectedPos(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-zinc-700 outline-none focus:bg-white"
                    >
                      <option value="All">All Parts of Speech</option>
                      <option value="noun">Noun (Нэр үг)</option>
                      <option value="verb">Verb (Үйл үг)</option>
                      <option value="adj">Adjective (Тэмдэг үг)</option>
                      <option value="adv">Adverb (Дайвар үг)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid holding the processed Vocabulary Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredWords.map((word) => {
                    const isLearned = learnedSet.has(word.id);
                    return (
                      <motion.div
                        layoutId={`word_card_${word.id}`}
                        key={word.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white p-8 rounded-5xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-85"
                      >
                        <div>
                          {/* Title / Badges */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2 py-0.5 bg-[#58007E]/5 text-[#58007E] text-[8px] font-black uppercase rounded tracking-wider">
                                  {word.level}
                                </span>
                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase rounded tracking-wider">
                                  {word.pos}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black italic font-serif text-zinc-900 group-hover:text-[#58007E] transition-colors inline-block mr-2">
                                {word.word}
                              </h3>
                              <button
                                onClick={() => speakWord(word.word)}
                                className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-400 hover:text-[#58007E] inline-flex items-center justify-center transition-colors align-middle"
                                title="Listen pronunciation"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => toggleLearned(word)}
                              className={`px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all ${isLearned ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10" : "bg-white border-zinc-200 text-zinc-400 hover:border-emerald-500 hover:text-emerald-500"}`}
                            >
                              {isLearned ? (
                                <Check size={12} strokeWidth={3} />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              {isLearned ? "Learned" : "Learn"}
                            </button>
                          </div>

                          {/* Mongolian translation */}
                          <p className="text-sm font-bold text-zinc-400 tracking-tight mb-4 lowercase">
                            Монгол :{" "}
                            <strong className="text-zinc-800 font-extrabold">
                              {word.translation}
                            </strong>
                          </p>

                          {/* English Definition details */}
                          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                            Category
                          </div>
                          <p className="text-xs font-semibold text-zinc-600 mb-5">
                            {word.category}
                          </p>

                          {/* Dual Example block */}
                          <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100 space-y-2">
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                                English Context
                              </p>
                              <p className="text-xs font-bold text-zinc-800 italic">
                                "{word.example}"
                              </p>
                            </div>
                            <div className="border-t border-zinc-100 pt-2">
                              <p className="text-[8px] font-black uppercase tracking-widest text-[#58007E]/55">
                                Mongolian Context
                              </p>
                              <p className="text-xs font-semibold text-zinc-500 italic">
                                "{word.exampleMn}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stamping date learned */}
                        {isLearned && (
                          <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-4 text-right flex items-center justify-end gap-1">
                            <Clock size={10} /> Learned{" "}
                            {word.dateLearned
                              ? new Date(word.dateLearned).toLocaleDateString()
                              : "recently"}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* No words empty outcome */}
              {filteredWords.length === 0 && (
                <div className="py-24 text-center bg-white rounded-5xl border border-dashed border-zinc-200 shadow-sm max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                    <BookOpen size={28} />
                  </div>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                    No matching words found.
                  </p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Try to broad your search terms or verify level filter.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* --- FLASHCARD STUDY VIEW --- */
            <motion.div
              key="flashcard-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto py-8"
            >
              {!practiceFinished ? (
                <div className="space-y-8">
                  {/* Progress Header */}
                  <div className="flex justify-between items-center bg-white border border-zinc-100 rounded-3xl px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-[#58007E]" />
                      <div>
                        <h3 className="text-base font-black italic font-serif">
                          Vocabulary Practice
                        </h3>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                          Active Session
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFlashcardMode(false)}
                      className="text-xs font-black uppercase text-zinc-400 hover:text-red-500 tracking-widest transition-colors"
                    >
                      Exit Session
                    </button>
                  </div>

                  {/* Top Bar Indicators */}
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>
                      Card {currentFlashcardIdx + 1} of {practicePool.length}
                    </span>
                    <span className="text-emerald-500">
                      Known: {sessionScore.correct}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#58007E]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((currentFlashcardIdx + 1) / practicePool.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* The Flapping 3D Card Base container */}
                  <div
                    className="relative cursor-pointer min-h-95 perspective-1000 group w-full"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="w-full h-full min-h-95 relative bg-white border border-zinc-200/60 rounded-6xl shadow-2xl p-10 flex flex-col justify-between"
                    >
                      {/* FRONT FACE (English) */}
                      <div
                        style={{ backfaceVisibility: "hidden" }}
                        className="absolute inset-0 p-10 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <span className="px-3 py-1 bg-[#58007E]/5 text-[#58007E] text-[9px] font-black rounded uppercase tracking-wider">
                            {practicePool[currentFlashcardIdx].level} •{" "}
                            {practicePool[currentFlashcardIdx].pos}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                            Click to flip
                          </span>
                        </div>

                        <div className="text-center my-auto">
                          <h2 className="text-5xl font-black italic font-serif text-zinc-900 tracking-tight leading-none mb-4">
                            {practicePool[currentFlashcardIdx].word}
                          </h2>
                          <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
                            How do you translate this term?
                          </p>
                        </div>

                        <div className="flex gap-4 items-center justify-center text-xs font-semibold text-zinc-400">
                          <Brain size={16} /> Category:{" "}
                          {practicePool[currentFlashcardIdx].category}
                        </div>
                      </div>

                      {/* BACK FACE (Mongolian Translation / Examples) */}
                      <div
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                        className="absolute inset-0 p-10 flex flex-col justify-between bg-zinc-950 rounded-6xl text-white"
                      >
                        <div className="flex justify-between items-start">
                          <span className="px-3 py-1 bg-white/10 text-zinc-300 text-[9px] font-black rounded uppercase tracking-wider">
                            Translation Revealed
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            Click to flip
                          </span>
                        </div>

                        <div className="text-center my-auto px-4">
                          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-2">
                            Mongolian meaning
                          </h4>
                          <h2 className="text-4xl font-extrabold italic text-[#AB4DFF] mb-6">
                            {practicePool[currentFlashcardIdx].translation}
                          </h2>

                          <div className="text-left space-y-3 bg-white/5 p-5 rounded-3xl border border-white/5">
                            <div>
                              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">
                                En Example
                              </p>
                              <p className="text-xs font-bold text-zinc-200 italic">
                                "{practicePool[currentFlashcardIdx].example}"
                              </p>
                            </div>
                            <div className="border-t border-white/5 pt-2">
                              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-wider">
                                Mn Translation
                              </p>
                              <p className="text-xs font-medium text-zinc-300 italic">
                                "{practicePool[currentFlashcardIdx].exampleMn}"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Click to rotate card back
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Know it / Don't know it Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFlashcardAnswer(false)}
                      className="flex-1 bg-white border-2 border-zinc-100 hover:border-red-400 text-zinc-600 hover:text-red-500 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                    >
                      ❌ Don't know it
                    </button>
                    <button
                      onClick={() => handleFlashcardAnswer(true)}
                      className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      ✅ I know it!
                    </button>
                  </div>
                </div>
              ) : (
                /* --- Practice Completed Outcome --- */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-zinc-100 rounded-6xl p-12 text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                    <Trophy size={48} />
                  </div>

                  <h2 className="text-4xl font-black italic font-serif leading-none tracking-tight mb-2">
                    Practice Completed!
                  </h2>
                  <p className="text-zinc-500 font-medium mb-8 max-w-sm mx-auto">
                    Great job mastering your customized learned words array!
                  </p>

                  <div className="bg-zinc-50 px-10 py-8 rounded-4xl inline-block mb-10 border border-zinc-100 text-center min-w-60">
                    <div className="text-5xl font-black text-[#58007E]">
                      {sessionScore.correct} / {practicePool.length}
                    </div>
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">
                      Active Score Accuracy
                    </div>
                  </div>

                  <div className="max-w-md mx-auto mb-8 text-left bg-emerald-50/30 p-6 rounded-3xl border border-emerald-50/60 flex items-start gap-4">
                    <Sparkles
                      className="text-emerald-500 shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-1">
                        AI Coaching insight
                      </p>
                      <p className="text-xs text-zinc-650 leading-relaxed font-bold">
                        {sessionScore.correct === practicePool.length
                          ? "Flawless progress! Your memory is razor-sharp. Keep tracking more words from Daily life or Academic sets to continue expanding."
                          : "Strong effort! Keep reviewing those cards you missed. Consistency is the single most important factor in language acquisition."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFlashcardMode(false);
                      setPracticeFinished(false);
                    }}
                    className="w-full bg-[#58007E] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#40005C] transition-all shadow-xl shadow-[#58007E]/20"
                  >
                    Back to Library
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

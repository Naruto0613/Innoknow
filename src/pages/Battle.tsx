import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Users, Sparkles, Trophy, Play, Check, X, Copy, Zap, Clock, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function Battle() {
  const { profile, updateProfile } = useAuth();
  
  // Game states: 'lobby', 'matchmaking', 'active', 'finished'
  const [gameState, setGameState] = useState<'lobby' | 'matchmaking' | 'active' | 'finished'>('lobby');
  const [battleType, setBattleType] = useState<'vocabulary' | 'grammar' | 'listening'>('vocabulary');
  const [isFriendMatch, setIsFriendMatch] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active game states
  const [opponent, setOpponent] = useState({ name: 'Чичиг Санжаа', level: 'B2', avatar: 'Ч', score: 0 });
  const [myScore, setMyScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timer, setTimer] = useState(10);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [opponentGuessing, setOpponentGuessing] = useState(false);

  // Blocking check for basic users: 7 days limit
  const [cooldownLeft, setCooldownLeft] = useState<string | null>(null);

  // Questions Database
  const questionsBank: Record<string, BattleQuestion[]> = {
    vocabulary: [
      { question: 'What is the Mongolian translation for "Pristine"?', options: ['Хугацаа хэтэрсэн', 'Хуучирсан', 'Олон янз', 'Орчин үеийн, онгон цэвэр'], correctIndex: 3 },
      { question: 'What does "Diligent" mean?', options: ['Хичээнгүй, ажилсаг', 'Зөрүүд, хайнга', 'Нойрмог', 'Уцаартай'], correctIndex: 0 },
      { question: 'Which word means "very cold"?', options: ['Scorching', 'Freezing', 'Boiling', 'Humid'], correctIndex: 1 },
      { question: 'Identify the synonym of "Vibrant":', options: ['Уйтгартай', 'Эрч хүчтэй, цоглог', 'Хурдан', 'Нарийн төвөгтэй'], correctIndex: 1 },
      { question: 'Choose the meaning of "Acquire":', options: ['Зарцуулах', 'Ачаалах', 'Худалдан авах, олж авах', 'Алдах'], correctIndex: 2 }
    ],
    grammar: [
      { question: 'Complete: If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'would be'], correctIndex: 2 },
      { question: 'Identify the correct sentence:', options: ['She don\'t likes coffee.', 'She doesn\'t likes coffee.', 'She doesn\'t like coffee.', 'She isn\'t like coffee.'], correctIndex: 2 },
      { question: 'Which is a passive sentence?', options: ['The cake was eaten by the dog.', 'The dog ate the cake.', 'The dog is eating cake.', 'The dog had a cake.'], correctIndex: 0 },
      { question: 'Complete: By next year, I ___ my degree.', options: ['will finish', 'will have finished', 'am finishing', 'have finished'], correctIndex: 1 },
      { question: 'Complete sentence: She came here ___ see her friend.', options: ['for to', 'so that', 'to', 'for'], correctIndex: 2 }
    ],
    listening: [
      { question: 'Listen / Transcribe: "He is a reliable friend." Which one is accurate?', options: ['He is a relative friend.', 'He is a real life friend.', 'He is a reliable friend.', 'He holds a reliable thread.'], correctIndex: 2 },
      { question: 'Select spelling for: /əˈkaʊntəbəl/', options: ['Acountible', 'Accounting', 'Accountable', 'Accountability'], correctIndex: 2 },
      { question: 'Which phrase means "to pay attention"?', options: ['Hear me out', 'Listen up', 'Hold on', 'Speak up'], correctIndex: 1 },
      { question: 'Complete the sentence: "I couldn\'t make ___ what he was saying due to the static."', options: ['up', 'out', 'over', 'off'], correctIndex: 1 },
      { question: 'Identify: "There are ___ people in the library today."', options: ['fewer', 'less', 'smaller', 'lowest'], correctIndex: 0 }
    ]
  };

  const activeQuestions = questionsBank[battleType];

  // Cooldown check on load
  useEffect(() => {
    if (!profile) return;
    const isBasic = false;
    if (!isBasic) return;

    const lastBattleStr = localStorage.getItem(`last_battle_time_${profile.uid}`);
    if (lastBattleStr) {
      const lastBattle = new Date(lastBattleStr).getTime();
      const difference = Date.now() - lastBattle;
      const cooldownPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      
      if (difference < cooldownPeriod) {
        const remainingMs = cooldownPeriod - difference;
        const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        setCooldownLeft(`${days} өдөр ${hours} цаг`);
      }
    }
  }, [profile, gameState]);

  // Timers during active game
  useEffect(() => {
    if (gameState !== 'active') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Time is up, simulate move to next question or end
          handleNextQuestion(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentQuestionIdx]);

  // Simulate opponent answering
  useEffect(() => {
    if (gameState !== 'active') return;
    setOpponentGuessing(true);

    const opponentTimeout = setTimeout(() => {
      setOpponentGuessing(false);
      const opponentCorrect = Math.random() > 0.35; // 65% accuracy
      if (opponentCorrect) {
        setOpponent(prev => ({ ...prev, score: prev.score + Math.round(10 + Math.random() * 5) }));
      }
    }, 3000 + Math.random() * 3000);

    return () => clearTimeout(opponentTimeout);
  }, [gameState, currentQuestionIdx]);

  if (!profile) return null;

  const generateLobbyCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setLobbyCode(code);
    setIsFriendMatch(true);
    setGameState('lobby');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`https://innoknow.mn/battle?room=${lobbyCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const startMatchmaking = () => {
    if (cooldownLeft) return; // Prevent basic user access
    setGameState('matchmaking');
    
    // Simulate opponent found after 3 seconds
    setTimeout(() => {
      setOpponent({
        name: ['Төгөлдөр Баяраа', 'Нинжмандах Батөр', 'Мөнх-Эрдэнэ Гансүх', 'Болортуяа Пүрэв'][Math.floor(Math.random() * 4)],
        level: ['A2', 'B1', 'B2', 'C1'][Math.floor(Math.random() * 4)],
        avatar: '👤',
        score: 0
      });
      setMyScore(0);
      setCurrentQuestionIdx(0);
      setTimer(10);
      setGameState('active');
    }, 3000);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null) return; // Already answered this round
    setSelectedOpt(idx);
    
    const correct = idx === activeQuestions[currentQuestionIdx].correctIndex;
    setIsAnswerCorrect(correct);

    if (correct) {
      // Points based on speed
      const newPoints = Math.round(10 + timer);
      setMyScore(prev => prev + newPoints);
    }
  };

  const handleNextQuestion = (userSkipped = false) => {
    setSelectedOpt(null);
    setIsAnswerCorrect(null);
    setTimer(10);

    if (currentQuestionIdx + 1 < activeQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Battle complete! Write results
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    
    const amWinner = myScore >= opponent.score;
    const gainedXp = amWinner ? 50 : 10; // 50 XP bonus for victory, 10 XP as consolation

    // Persist battle details to Firestore
    const battleId = 'BT_' + Math.random().toString(36).substring(2, 11);
    const battleRecord = {
      id: battleId,
      player1: profile.uid,
      player2: 'opponent_ai_simulation',
      type: battleType,
      winner: amWinner ? profile.uid : 'opponent_ai_simulation',
      xpAwarded: gainedXp,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'battles', battleId), battleRecord);
    } catch (e) {
      console.warn("Could not save battle record to firestore:", e);
    }

    // Update Profile statistics
    const isBasic = profile.plan === 'trial' ? false : profile.plan === 'basic';
    const postBattleStats: any = {
      xp: (profile.xp || 100) + gainedXp,
      battleWins: (profile.battleWins || 0) + (amWinner ? 1 : 0),
      battleLosses: (profile.battleLosses || 0) + (amWinner ? 0 : 1)
    };

    // Store Last battle timestamp for basic cooldown rules
    if (isBasic) {
      localStorage.setItem(`last_battle_time_${profile.uid}`, new Date().toISOString());
    }

    await updateProfile(postBattleStats);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFCFB] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-center mb-6">
            <Swords className="text-[#58007E] mx-auto w-16 h-16 animate-bounce" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-serif italic text-slate-900 tracking-tight">Эрдэм Мэдлэгийн Дуэл Батл</h1>
          <p className="text-slate-500 mt-2 font-medium text-xs md:text-sm">
            Английн хэлний дүрэм, үгсийн сангийн хурдаар бусадтай өрсөлдөх дуэль аялал. Ялагч бүр <span className="text-[#58007E] font-black">+50 XP</span> авна!
          </p>
        </div>

        {/* COOLDOWN WARNING FOR BASIC USERS */}
        {cooldownLeft && gameState === 'lobby' && (
          <div className="mb-6 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-bold leading-relaxed">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
              <p className="uppercase tracking-wide font-black">7 хоногийн Батл хязгаарлалт идэвхтэй байна!</p>
              <p className="font-semibold text-red-600">Та Basic (Үнэгүй) хэрэглэгч тул 7 хоногт 1 л удаа өрсөлдөх боломжтой. Дараагийн батл орох хүртэл {cooldownLeft} үлдлээ. <a href="/pricing" className="underline font-extrabold text-[#58007E]">Pro/Premium багц сонгон хязгааргүй тоглоорой!</a></p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LOBBY VIEW */}
          {gameState === 'lobby' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white p-8 md:p-12 border border-slate-100 rounded-[36px] shadow-2xl shadow-indigo-100"
            >
              <h3 className="text-lg font-bold font-serif mb-6 text-slate-800">Батл дуэлийн хэлбэр сонгох</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { id: 'vocabulary' as const, label: 'Үгийн Сангийн Батл', desc: 'Англи үгсийн зөв орчуулга, синонимуудыг хамгийн хурдан олох тэмцээн.', bg: 'bg-indigo-50 border-indigo-100 text-[#58007E]' },
                  { id: 'grammar' as const, label: 'Дүрмийн Хурдны Раунд', desc: 'Анхан болон гүнзгий дүрмийн зөв хэрэглээг сонгох хурдны дуэл.', bg: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
                  { id: 'listening' as const, label: 'Сонсгол Сонжилт', desc: 'Бичлэгийн дуудлагыг зөв транскрипцлэх, ярианы нарийвчилсан дүн.', bg: 'bg-amber-50 border-amber-100 text-amber-800' },
                ].map((type) => {
                  const isChosen = battleType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setBattleType(type.id)}
                      className={`p-6 rounded-3xl border text-left transition-all ${
                        isChosen ? 'ring-2 ring-indigo-500 bg-indigo-50/20' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <h4 className="text-sm font-black mb-2 uppercase tracking-wide">{type.label}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 leading-relaxed mb-4">{type.desc}</p>
                      <div className={`text-[10px] uppercase tracking-widest font-black inline-block px-3 py-1 rounded-full ${type.bg}`}>
                        Сонгох
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* FRIEND LOBBY CREATOR */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Найзыгаа Дуэльд Урих уу?</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Орж уралдах хувийн батл холбоос үүсгэх.</p>
                </div>
                <button
                  onClick={generateLobbyCode}
                  className="px-6 py-3 bg-indigo-50 text-[#58007E] hover:bg-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Холбоос Үүсгэх
                </button>
              </div>

              {lobbyCode && (
                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-8 flex items-center justify-between gap-4">
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider mb-1">Матч холбоос:</span>
                    <span className="text-xs font-bold font-mono text-slate-700 truncate block">https://innoknow.mn/battle?room={lobbyCode}</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer shrink-0 ${copiedCode ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-600 text-white'}`}
                  >
                    {copiedCode ? '✅ Хуулагдлаа!' : <><Copy size={13} className="inline mr-1" /> Хуулах</>}
                  </button>
                </div>
              )}

              {/* matchmaking actions */}
              <button
                onClick={startMatchmaking}
                disabled={!!cooldownLeft}
                className="w-full bg-[#58007E] hover:bg-[#40005C] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-100 cursor-pointer disabled:opacity-40"
              >
                {cooldownLeft ? 'Батлын хязгаарлалт дуусаагүй байна' : 'Олон нийтээр Өрсөлдөх (matchmaking)'}
              </button>
            </motion.div>
          )}

          {/* MATCHMAKING ANIMATION */}
          {gameState === 'matchmaking' && (
            <motion.div
              key="matchmaking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-12 text-center rounded-[48px] border border-slate-100 shadow-xl py-24"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <Swords className="w-12 h-12 text-[#58007E] absolute inset-0 m-auto animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-[#58007E] border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-black font-serif italic text-slate-800 mb-2">Хослох сурагч хайж байна...</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Дуэль эхлэхэд бэлтгэнэ үү</p>
            </motion.div>
          )}

          {/* ACTIVE BATTLE */}
          {gameState === 'active' && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* SCOREBOARD RAIL */}
              <div className="grid grid-cols-2 gap-4">
                {/* Participant 1: ME */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">😎</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase">Та</h4>
                      <p className="text-[10px] font-bold text-slate-500">XP өсөлт: +{myScore}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-700 font-mono">{myScore}</span>
                  </div>
                </div>

                {/* Participant 2: Opponent */}
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opponent.avatar || '👤'}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-850 uppercase">{opponent.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500">Түвшин: {opponent.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-600 font-mono">{opponent.score}</span>
                  </div>
                </div>
              </div>

              {/* TIMED BAR */}
              <div className="bg-slate-100 rounded-full h-2 w-full overflow-hidden">
                <motion.div
                  className="bg-[#58007E] h-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timer / 10) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                  key={currentQuestionIdx + '_' + timer}
                />
              </div>

              {/* QUESTION CARD */}
              <div className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-xl relative">
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Clock size={14} /> {timer}сек
                </div>
                
                <span className="text-[10px] font-black uppercase text-[#58007E] tracking-widest">Асуулт {currentQuestionIdx + 1} / 5</span>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mt-2 mb-8 leading-relaxed">
                  {activeQuestions[currentQuestionIdx].question}
                </h3>

                {/* OPTIONS LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrect = oIdx === activeQuestions[currentQuestionIdx].correctIndex;
                    
                    let btnClass = 'bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100';
                    let iconBadge = null;

                    if (selectedOpt !== null) {
                      if (isSelected) {
                        btnClass = isCorrect ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-rose-100 border-rose-200 text-rose-800';
                        iconBadge = isCorrect ? <Check size={16} /> : <X size={16} />;
                      } else if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                      } else {
                        btnClass = 'opacity-50 bg-slate-50 border-slate-100 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={selectedOpt !== null}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all relative flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {iconBadge}
                      </button>
                    );
                  })}
                </div>

                {/* INTERACTION AND OPPONENT PROGRESS */}
                <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-6">
                  <div>
                    {opponentGuessing ? (
                      <span className="text-[11px] font-semibold text-rose-500 animate-pulse">⚡ Өрсөлдөгч хариулж байна...</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600">✓ Өрсөлдөгч хариуллаа</span>
                    )}
                  </div>
                  {selectedOpt !== null && (
                    <button
                      onClick={() => handleNextQuestion(false)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Дараагийн хичээл <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS VIEW */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl text-center"
            >
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="animate-bounce" />
              </div>

              {myScore >= opponent.score ? (
                <div>
                  <h2 className="text-3xl font-black font-serif italic text-slate-900 mb-2">Та яллаа! 🎉</h2>
                  <p className="text-xs font-bold text-[#58007E] uppercase tracking-widest mb-6">Хүчирхэг ялалт байгуулж +50 XP урамшуулал авлаа</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-black font-serif italic text-slate-900 mb-2">Дуэль өндөрлөлөө!</h2>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-6">Бага зэрэг дутуу байна! Сэтгэлээр бүү унаарай. +10 XP солигдлоо</p>
                </div>
              )}

              {/* Tally Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Таны оноо</span>
                  <span className="text-lg font-black text-indigo-700">{myScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">{opponent.name}</span>
                  <span className="text-lg font-black text-rose-600">{opponent.score}</span>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={() => setGameState('lobby')}
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer"
                >
                  Шинэ раунд эхлэх
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

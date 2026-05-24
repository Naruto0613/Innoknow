import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ADMIN_UIDS } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  Flame,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Check,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Crown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, getDeviceID } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ticker for trial countdown & redirect on expiry
  useEffect(() => {
    if (profile?.plan !== 'trial' || !profile?.trialEnd) return;

    const timer = setInterval(() => {
      const end = new Date(profile.trialEnd!).getTime();
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(timer);
        navigate('/pricing');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeRemaining(`${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [profile?.trialEnd, profile?.plan, navigate]);

  // Initial load redirect if trial is already expired
  useEffect(() => {
    if (!profile) return;
    const isUserAdmin = ADMIN_UIDS.includes(profile.uid);
    if (isUserAdmin) return;

    if (profile.plan === 'trial') {
      const isExpired = new Date(profile.trialEnd || '').getTime() <= Date.now();
      if (isExpired) {
        navigate('/pricing');
      }
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (user) {
      const key = `innoknow_user_progress_${user.email}`;
      const storedProgress = localStorage.getItem(key);
      if (storedProgress) {
        try {
          setProgress(JSON.parse(storedProgress));
        } catch (err) {
          console.error("Failed to parse progress:", err);
        }
      } else {
        const initialProgress = [
          { title: "Grammar Mastery Check", type: "Quiz", score: "5/5", date: "Today" },
          { title: "IELTS Speaking Part 2", type: "Practice", score: "Band 7.0", date: "Yesterday" },
          { title: "Vocabulary Core Core Set", type: "Flashcards", score: "100%", date: "2 days ago" }
        ];
        localStorage.setItem(key, JSON.stringify(initialProgress));
        setProgress(initialProgress);
      }
    }
  }, [user]);

  if (!user || !profile) {
    return <div className="p-20 text-center">Please sign in to view your dashboard.</div>;
  }

  // Access validation logic
  const isUserAdmin = ADMIN_UIDS.includes(user.uid);
  const isBasic = profile.plan === 'basic';
  const isSubscriptionPaid = (profile.plan === 'pro' || profile.plan === 'premium') && profile.paymentStatus === 'Approved';
  const isTrialActive = profile.plan === 'trial' && !!(profile.trialEnd && new Date(profile.trialEnd).getTime() > Date.now());
  const hasAccess = isUserAdmin || isSubscriptionPaid || isTrialActive || isBasic;

  // Render countdown state title helper
  let trialStateLabel = "";
  if (isUserAdmin) {
    trialStateLabel = "⭐️ ADMIN UNLIMITED ACCESS";
  } else if (isSubscriptionPaid) {
    const expiryDate = profile.accessExpiry ? new Date(profile.accessExpiry).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    trialStateLabel = `👑 PAID ACCESS ACTIVE (${profile.plan.toUpperCase()} - ${daysLeft} DAYS LEFT)`;
  } else if (isBasic) {
    trialStateLabel = "ℹ️ BASIC PLAN (FREE)";
  } else if (isTrialActive) {
    trialStateLabel = `⚡️ Таны trial: ${timeRemaining || 'Уншиж байна...'} үлдлээ`;
  } else {
    trialStateLabel = "❌ ACCESS EXPIRED";
  }

  // Submit join access request for approval
  const handleRequestAccess = async () => {
    if (!confirmedTransfer) {
      setErrorMessage("Please complete the bank transfer and confirm by checking the box.");
      return;
    }

    setSubmittingRequest(true);
    setErrorMessage('');

    try {
      const deviceId = getDeviceID();
      const currentRequests = JSON.parse(localStorage.getItem('innoknow_joining_requests') || '[]');
      
      const newRequest = {
        id: profile.uid,
        name: profile.displayName,
        email: profile.email,
        registrationDate: profile.createdAt || new Date().toISOString(),
        trialStatus: isTrialActive ? 'Active' : 'Expired',
        deviceId: deviceId,
        accepts: [], // Both admins must accept before approval
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Filter out stale pending duplicates from matching UID
      const filteredRequests = currentRequests.filter((r: any) => r.id !== profile.uid);
      filteredRequests.push(newRequest);
      
      localStorage.setItem('innoknow_joining_requests', JSON.stringify(filteredRequests));

      // Update current user profile status
      await updateProfile({ requestAccessStatus: 'pending' });
      setShowPaymentModal(false);
      setConfirmedTransfer(false);
    } catch (err: any) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6 relative">
      
      {/* ACCESS EXPIRED GLASS OVERLAY PANEL */}
      {!hasAccess && (
        <div className="absolute inset-x-4 md:inset-x-8 top-4 md:top-8 bottom-4 md:bottom-8 z-40 bg-zinc-950/70 backdrop-blur-md rounded-[48px] flex flex-col items-center justify-center text-center p-8 border border-white/10">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl bg-white rounded-[40px] p-10 md:p-12 shadow-2xl border border-zinc-100 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center shadow-inner mb-6">
              <AlertCircle size={40} />
            </div>

            <h2 className="text-4xl font-black font-serif italic text-zinc-900 tracking-tight leading-none mb-4">Your trial has ended</h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
              We hope you enjoyed exploring the INNOKNOW platform! Unlock 1-Month of unlimited learning access to speaking simulators, listening evaluations, and grammar modules for just <strong className="text-zinc-900 font-extrabold">5,000 ₮</strong>.
            </p>

            {profile.requestAccessStatus === 'pending' ? (
              <div className="bg-slate-50 border border-slate-100 px-8 py-6 rounded-3xl w-full text-center space-y-2 mb-6">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Pending Approval (Reviewing Payment)
                </p>
                <p className="text-xs text-zinc-400 font-medium">
                  We are waiting for BOTH administrators to accept your subscription request. This usually takes 5 to 30 minutes!
                </p>
              </div>
            ) : profile.requestAccessStatus === 'rejected' ? (
              <div className="space-y-6 w-full">
                <div className="bg-red-50 border border-red-100 px-6 py-4 rounded-3xl text-left">
                  <p className="text-sm font-bold text-red-500 uppercase tracking-tight">Your request was rejected</p>
                  <p className="text-xs text-red-400 font-medium mt-1">We couldn't verify your transfer of 5,000 ₮. Make sure to complete the transfer and request access again.</p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-5 bg-[#58007E] text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#40005C] transition-all shadow-xl shadow-[#58007E]/20"
                >
                  Submit Payment Request Again
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-5 bg-[#58007E] text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#40005C] transition-all shadow-xl shadow-[#58007E]/20"
              >
                Request Full Access
              </button>
            )}
            
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-6">
              Device identification code: {getDeviceID()}
            </p>
          </motion.div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-zinc-100 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#58007E] text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-[#58007E]/20 font-black italic">
            {profile?.displayName?.[0] || user.email?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 italic font-serif">Welcome back, {profile?.displayName || 'Student'}!</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1.5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 align-middle">
                Current Level: <span className="text-[#58007E] bg-[#58007E]/5 px-2 py-0.5 rounded-lg font-extrabold">{profile?.level || 'A2'}</span>
              </span>
              <span className="hidden sm:inline text-zinc-200">•</span>
              <span className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-0.5 inline-block ${isSubscriptionPaid ? 'text-emerald-500 bg-emerald-500/5' : isTrialActive ? 'text-indigo-500 bg-indigo-500/5' : 'text-amber-500 bg-amber-500/5'}`}>
                {trialStateLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 px-6 py-3 rounded-2xl items-center gap-2 border border-amber-100 flex shadow-sm">
             <Flame className="text-amber-600" size={20} />
             <span className="text-[10px] font-black text-amber-700 tracking-widest uppercase">{profile?.streak || 0} DAY STREAK</span>
          </div>
          <div className="bg-indigo-50 px-6 py-3 rounded-2xl items-center gap-2 border border-indigo-100 flex shadow-sm">
             <Trophy className="text-indigo-600" size={20} />
             <span className="text-[10px] font-black text-indigo-700 tracking-widest uppercase">{profile?.xp || 100} XP</span>
          </div>
        </div>
      </div>

      {profile.plan === 'trial' && isTrialActive && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-[#58007E]/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-[#58007E] rounded-xl shadow-md border border-purple-100">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Үнэгүй Туршилтын Хугацаа</p>
              <p className="text-sm font-black text-[#58007E] mt-0.5">Таны trial: {timeRemaining || 'хэмжиж байна...'} үлдлээ</p>
            </div>
          </div>
          <Link 
            to="/pricing"
            className="bg-[#58007E] hover:bg-[#40005C] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
          >
            Багц сонгож идэвхжүүлэх
          </Link>
        </div>
      )}

      {profile.plan === 'basic' && (
        <div className="bg-[#58007E]/5 border border-[#58007E]/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-[#58007E] rounded-xl shadow-sm border border-slate-100">
              <Crown className="text-amber-500" size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">PRO багц руу ахиулах</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Таны одоогийн багц Basic (Үнэгүй) тул өдөрт 1 хичээл, сургуулийн чарт болон 7 хоногт 1 өрсөлдөөнөөр хязгаарлагдаж байна.</p>
            </div>
          </div>
          <Link 
            to="/pricing"
            className="bg-[#58007E] hover:bg-[#40005C] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md text-center"
          >
            Pro/Premium багц сонгох
          </Link>
        </div>
      )}

      <main className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Section: Tutor & Levels */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Tutor Bento */}
          <div className="bg-indigo-900 rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between text-white shadow-2xl flex-1 min-h-[300px]">
            <div className="z-10">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Live Now</span>
              <h2 className="text-4xl font-extrabold mt-6 leading-tight italic font-serif text-white text-left">Practice Speaking <br/>with AI Tutors</h2>
              <p className="text-indigo-100/70 mt-3 max-w-sm text-sm font-medium text-left">Get real-time feedback on your IELTS Speaking Part 2 topics.</p>
            </div>
            
            <div className="z-10 flex items-center gap-6 mt-8">
              <Link to="/ielts" className="px-8 py-3.5 bg-white text-indigo-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-indigo-950/20">
                Start Session
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-indigo-900 bg-slate-${300 + i*100}`}></div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">12 others practicing</span>
              </div>
            </div>

            <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute right-10 bottom-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* Level Switcher Bento */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest text-left">Quick Level Access</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
                <button
                  key={l}
                  onClick={() => updateProfile({ level: l })}
                  className={`py-4 rounded-2xl border-2 transition-all cursor-pointer group ${profile?.level === l ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-50 hover:border-indigo-200 text-slate-400'}`}
                >
                  <div className="text-sm font-black tracking-tighter">{l}</div>
                  <div className="text-[9px] font-bold opacity-60 uppercase mt-1">Level</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Stats Bento */}
        <div className="lg:col-span-5 grid grid-cols-2 grid-rows-3 gap-6">
          {/* Main Stat 1 */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
               <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-900 tracking-tighter italic text-left">84%</div>
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 text-left">Fluency Rank</div>
            </div>
          </div>

          {/* Main Stat 2 */}
          <div className="bg-violet-50 border border-violet-100 rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
               <BookOpen size={20} />
            </div>
            <div>
              <div className="text-3xl font-black text-violet-900 tracking-tighter italic text-left">
                {profile.learnedWords?.length || 0}
              </div>
              <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mt-1 text-left">Words Learned</div>
            </div>
          </div>

          {/* Wide Progress Bento */}
          <div className="col-span-2 bg-slate-900 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1 text-left">Mastery Progress</h4>
                <div className="text-3xl font-black italic font-serif text-left">Level {profile?.level || 'A1'}</div>
              </div>
              <span className="text-[10px] font-black italic opacity-40">TARGET: C1</span>
            </div>
            
            <div className="relative z-10 mt-8">
              <div className="flex justify-between items-center text-[10px] font-black tracking-widest mb-3 uppercase">
                <span className="text-indigo-400">Fluency Boost</span>
                <span className="text-white">68%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                ></motion.div>
              </div>
            </div>
            {/* Background design elements */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>
          </div>

          {/* Feedback Card Bento */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col justify-between text-left">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expert AI Feedback</h4>
              <span className="text-[10px] font-bold text-slate-300">2H AGO</span>
            </div>
            <p className="text-sm font-medium italic text-slate-700 leading-relaxed text-left">
              "Great handle on complex sentence structures! Try incorporating more phrasal verbs to sound more natural."
            </p>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              {['Idioms', 'Syntax', 'Accent'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Course Strip Bento */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-5 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
        <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-8 shrink-0 w-full sm:w-auto">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-indigo-100 font-bold">🎓</div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Enrolled</p>
            <p className="text-[10px] font-bold text-slate-400">3 Courses active</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden w-full">
          {[
            { title: 'IELTS Intensive Speaking', code: 'IEL', progress: 65, color: 'bg-indigo-600' },
            { title: 'Business Communication', code: 'BUS', progress: 12, color: 'bg-amber-500' }
          ].map(c => (
            <Link key={c.code} to="/courses" className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-3 px-5 flex items-center justify-between hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 truncate">
                <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-black/10`}>{c.code}</div>
                <span className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{c.title}</span>
              </div>
              <span className="text-[10px] font-black text-slate-300 ml-4">{c.progress}%</span>
            </Link>
          ))}
        </div>
        <Link to="/courses" className="p-3 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-black/10 hidden sm:block">
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* TUITION PAYMENT FORM MODAL WINDOW */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-[#58007E] p-8 text-white text-left relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-serif italic">Tuition Access Request</h3>
                    <p className="text-[9px] font-black uppercase text-purple-200 tracking-wider">Complete local bank wire transfer</p>
                  </div>
                </div>
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </div>

              <div className="p-8 space-y-6 text-left max-h-[70vh] overflow-y-auto">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Tuition Fee</p>
                      <p className="text-lg font-black text-[#58007E]">5,000 ₮ / Month</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Beneficiary Bank</p>
                      <p className="text-base font-bold text-zinc-800">Khaan Bank 🏦</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/65 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black uppercase text-zinc-400">Account Name</p>
                        <p className="text-xs font-black text-zinc-800">INNOKNOW PREP</p>
                      </div>
                      <span className="text-[9px] font-extrabold text-zinc-300">Default</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black uppercase text-zinc-400">Account Number</p>
                        <p className="text-sm font-black text-[#58007E] font-mono">5222 111 351</p>
                      </div>
                      <span className="text-[8px] font-black bg-[#58007E]/5 text-[#58007E] px-2 py-1 rounded">Copy</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black uppercase text-zinc-400">Iban Code</p>
                        <p className="text-sm font-black text-zinc-850 font-mono">30 0002 00</p>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-300">Placeholder QR</span>
                    </div>

                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black uppercase text-indigo-500">Required Memo Reference</p>
                        <p className="text-xs font-black text-indigo-900 font-mono">{user.email}</p>
                      </div>
                      <span className="text-[8px] font-black text-indigo-600 bg-white border border-indigo-100 px-2 py-0.5 rounded animate-pulse">Required</span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-500 uppercase tracking-tight">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={confirmedTransfer} 
                      onChange={(e) => setConfirmedTransfer(e.target.checked)}
                      className="mt-1 w-4.5 h-4.5 rounded text-[#58007E] focus:ring-[#58007E]/10"
                    />
                    <span className="text-xs font-semibold text-zinc-600 leading-relaxed">
                      I confirm that I have wired exactly <strong className="text-zinc-950">5,000 ₮</strong> to the Khaan Bank account above and specified my e-mail address <strong className="text-[#58007E]">{user.email}</strong> as the transactions' transfer reference.
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-500 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestAccess}
                    disabled={submittingRequest}
                    className="flex-1 py-4 bg-[#58007E] hover:bg-[#40005C] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#58007E]/20 cursor-pointer disabled:opacity-50"
                  >
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

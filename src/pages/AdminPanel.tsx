import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth, ADMIN_UIDS, isUserAdmin } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Trophy, 
  Award, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Calendar,
  AlertCircle,
  ArrowRightLeft,
  Flame,
  MessageSquare,
  Lightbulb,
  Heart,
  HelpCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function AdminPanel() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'active' | 'trials' | 'stats' | 'feedback'>('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Feedback Filters State
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');

  // Check if Admin
  if (!user || !isUserAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  // Periodic visual count re-render tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch requests, profiles, and feedbacks database from firebase and falling back to localstorage
  const loadData = async () => {
    // 1. Load Requests
    let fbReqs: any[] = [];
    try {
      const q = await getDocs(collection(db, 'paymentRequests'));
      q.forEach(docSnap => {
        fbReqs.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      console.warn("Could not query paymentRequests from firestore:", e);
      const loadedRequests = JSON.parse(localStorage.getItem('innoknow_joining_requests') || '[]');
      const premiumReqsMap = JSON.parse(localStorage.getItem('innoknow_payment_requests') || '{}');
      const premiumReqsList = Object.entries(premiumReqsMap).map(([uid, r]: [string, any]) => ({
        id: uid,
        userId: uid,
        ...r
      }));
      const mergedMap = new Map();
      loadedRequests.forEach((r: any) => { if (r) mergedMap.set(r.id || r.userId, r); });
      premiumReqsList.forEach((r: any) => { if (r) mergedMap.set(r.id || r.userId, r); });
      fbReqs = Array.from(mergedMap.values());
    }
    setRequests(fbReqs);

    // 2. Load User Profiles
    let fbUsers: any[] = [];
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(uSnap => {
        const uData = uSnap.data();
        fbUsers.push({
          uid: uSnap.id,
          displayName: uData.displayName || 'Сурагч',
          email: uData.email || 'Email',
          xp: uData.xp || 0,
          level: uData.level || 'A1',
          streak: uData.streak || 0,
          plan: uData.plan || 'expired',
          paymentStatus: uData.paymentStatus || '',
          accessExpiry: uData.accessExpiry || uData.trialEnd || '',
          trialEnd: uData.trialEnd || '',
          deviceId: uData.deviceId || 'N/A'
        });
      });
    } catch (e) {
      console.warn("Could not query users from firestore:", e);
      const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
      fbUsers = Object.values(allProfiles).map((u: any) => ({
        uid: u.uid || 'u_' + Math.random().toString(),
        displayName: u.displayName || 'Сурагч',
        email: u.email || '',
        xp: u.xp || 0,
        level: u.level || 'A2',
        streak: u.streak || 0,
        plan: u.plan || 'expired',
        paymentStatus: u.paymentStatus || '',
        accessExpiry: u.accessExpiry || '',
        trialEnd: u.trialEnd || '',
        isPaid: u.isPaid
      }));
    }
    setProfilesList(fbUsers);

    // 3. Load Feedback
    let fbFeedbacks: any[] = [];
    try {
      const feedSnap = await getDocs(collection(db, 'feedback'));
      feedSnap.forEach(docSnap => {
        fbFeedbacks.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      console.warn("Could not query feedback from firestore:", e);
      fbFeedbacks = JSON.parse(localStorage.getItem('innoknow_feedbacks') || '[]');
    }

    // Merge localized storage additions to be safe
    const localFbs = JSON.parse(localStorage.getItem('innoknow_feedbacks') || '[]');
    const mergedFeedbacks = [...fbFeedbacks];
    localFbs.forEach((lf: any) => {
      if (!mergedFeedbacks.some(f => f.id === lf.id)) {
        mergedFeedbacks.push(lf);
      }
    });
    setFeedbacks(mergedFeedbacks);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Change Feedback status
  const handleChangeFeedbackStatus = async (feedbackId: string, newStatus: 'new' | 'read' | 'resolved') => {
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      await updateDoc(docRef, { status: newStatus });
      alert('Санал хүсэлтийн төлөв амжилттай солигдлоо!');
      loadData();
      return;
    } catch (err) {
      console.warn("Firestore feedback update state error:", err);
    }
    // Local fallback
    const loaded = JSON.parse(localStorage.getItem('innoknow_feedbacks') || '[]');
    const updated = loaded.map((f: any) => f.id === feedbackId ? { ...f, status: newStatus } : f);
    localStorage.setItem('innoknow_feedbacks', JSON.stringify(updated));
    alert('Төлөв солигдлоо! (Local)');
    loadData();
  };

  // Delete Feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Уг санал хүсэлтийг устгах уу?')) return;
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      await deleteDoc(docRef);
      alert('Амжилттай устгагдлаа!');
      loadData();
      return;
    } catch (err) {
      console.warn("Firestore feedback delete error:", err);
    }
    // Local fallback
    const loaded = JSON.parse(localStorage.getItem('innoknow_feedbacks') || '[]');
    const filtered = loaded.filter((f: any) => f.id !== feedbackId);
    localStorage.setItem('innoknow_feedbacks', JSON.stringify(filtered));
    alert('Устгагдлаа! (Local)');
    loadData();
  };

  // Accept request under single admin approval
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const reqRef = doc(db, 'paymentRequests', requestId);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const reqData = reqSnap.data() || {};
        const planToActivate = reqData.plan || 'pro';
        
        // Approve in user document - single admin is sufficient now!
        const userRef = doc(db, 'users', requestId);
        await updateDoc(userRef, {
          plan: planToActivate,
          paymentStatus: 'Approved',
          accessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        // remove request
        await deleteDoc(reqRef);
        alert(`🎉 Хэрэглэгчийн ${planToActivate.toUpperCase()} эрх амжилттай идэвхжлээ!`);
        loadData();
        return;
      }
    } catch (err) {
      console.error("Firestore single admin accept error:", err);
    }

    // Local Fallback
    const loadedRequests = JSON.parse(localStorage.getItem('innoknow_joining_requests') || '[]');
    const premiumReqsMap = JSON.parse(localStorage.getItem('innoknow_payment_requests') || '{}');
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');

    // Find in loadedRequests or paymentRequests
    let targetReq = loadedRequests.find((req: any) => req.id === requestId || req.userId === requestId);
    if (!targetReq && premiumReqsMap[requestId]) {
      targetReq = { id: requestId, ...premiumReqsMap[requestId] };
    }

    if (targetReq) {
      const targetEmail = targetReq.userEmail || targetReq.email;
      const userProfile = allProfiles[targetEmail] || {};
      const planToActivate = targetReq.plan || 'pro';
      
      userProfile.isPaid = true;
      userProfile.plan = planToActivate;
      userProfile.paymentStatus = 'Approved';
      userProfile.accessExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      allProfiles[targetEmail] = userProfile;

      // Clean up requests
      const filteredJoining = loadedRequests.filter((req: any) => req.id !== requestId && req.userId !== requestId);
      delete premiumReqsMap[requestId];

      localStorage.setItem('innoknow_joining_requests', JSON.stringify(filteredJoining));
      localStorage.setItem('innoknow_payment_requests', JSON.stringify(premiumReqsMap));
      localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
      
      alert(`🎉 Хэрэглэгч ${targetReq.userName || targetReq.name || 'Сурагч'}-д 30 хоногийн ${planToActivate.toUpperCase()} сургалтын эрх идэвхжүүллээ.`);
    }

    loadData();
  };

  // Reject request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const reqRef = doc(db, 'paymentRequests', requestId);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const reqData = reqSnap.data() || {};
        const email = reqData.userEmail || '';
        
        // update user statuses
        const userRef = doc(db, 'users', requestId);
        await updateDoc(userRef, {
          paymentStatus: 'Rejected',
          plan: 'expired'
        });

        await deleteDoc(reqRef);
        console.log(`[MAIL SERVER] Triggered rejection email notification template to: ${email}`);
        alert(`❌ Хүсэлтийг цуцаллаа. Татгалзсан имэйл мэдэгдэл илгээгдлээ.`);
        loadData();
        return;
      }
    } catch (e) {
      console.warn("Firestore reject error:", e);
    }

    // Local Fallback
    const loadedRequests = JSON.parse(localStorage.getItem('innoknow_joining_requests') || '[]');
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    const targetReq = loadedRequests.find((r: any) => r.id === requestId);

    if (targetReq) {
      const targetEmail = targetReq.email;
      const userProfile = allProfiles[targetEmail] || {};
      
      userProfile.paymentStatus = 'Rejected';
      userProfile.plan = 'expired';
      allProfiles[targetEmail] = userProfile;

      const filtered = loadedRequests.filter((r: any) => r.id !== requestId);
      localStorage.setItem('innoknow_joining_requests', JSON.stringify(filtered));
      localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
      alert(`❌ Хүсэлт татгалзлаа. Хэрэглэгч рүү имэйл илгээлээ.`);
    }

    loadData();
  };

  // Revoke Access
  const handleRevokeAccess = async (userId: string, email: string) => {
    try {
      const uRef = doc(db, 'users', userId);
      await updateDoc(uRef, {
        plan: 'expired',
        paymentStatus: 'Revoked',
        accessExpiry: ''
      });
      alert(`✓ Төлбөртэй эрхийг цуцаллаа.`);
      loadData();
      return;
    } catch (e) {
      console.warn("Error revoking path:", e);
    }

    // Local Fallback
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    if (allProfiles[email]) {
      allProfiles[email].isPaid = false;
      allProfiles[email].plan = 'expired';
      allProfiles[email].accessExpiry = '';
      localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
    }
    loadData();
  };

  // Extend Access
  const handleExtendAccess = async (userId: string, email: string, days: number) => {
    const additionMs = days * 24 * 60 * 60 * 1000;
    try {
      const uRef = doc(db, 'users', userId);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data() || {};
        const currentExp = uData.accessExpiry ? new Date(uData.accessExpiry).getTime() : Date.now();
        const nextExp = new Date(currentExp + additionMs).toISOString();

        await updateDoc(uRef, {
          plan: uData.plan === 'basic' || uData.plan === 'expired' || uData.plan === 'trial' ? 'pro' : uData.plan, // upgrade label
          paymentStatus: 'Approved',
          accessExpiry: nextExp
        });
        alert(`✓ Сургалтын эрхийг +${days} хоногоор сунгалаа.`);
        loadData();
        return;
      }
    } catch (e) {
      console.warn("Firestore extension error:", e);
    }

    // Local Fallback
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    if (allProfiles[email]) {
      const prof = allProfiles[email];
      const start = prof.accessExpiry ? new Date(prof.accessExpiry).getTime() : Date.now();
      prof.isPaid = true;
      prof.accessExpiry = new Date(start + additionMs).toISOString();
      allProfiles[email] = prof;
      localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
    }
    loadData();
  };

  // Derived sections
  const unreadFeedbackCount = useMemo(() => {
    return feedbacks.filter(f => f.status === 'new').length;
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchType = feedbackTypeFilter === 'all' || f.type === feedbackTypeFilter;
      const matchStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
      return matchType && matchStatus;
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [feedbacks, feedbackTypeFilter, feedbackStatusFilter]);

  const activePaidUsers = useMemo(() => {
    return profilesList.filter(p => (p.plan === 'pro' || p.plan === 'premium') && p.accessExpiry && new Date(p.accessExpiry).getTime() > Date.now());
  }, [profilesList]);

  const activeTrialUsers = useMemo(() => {
    return profilesList.filter(p => p.plan === 'trial' && p.trialEnd && new Date(p.trialEnd).getTime() > currentTime);
  }, [profilesList, currentTime]);

  const parsedStats = useMemo(() => {
    const totalUsers = profilesList.length;
    const totalPaid = activePaidUsers.length;
    const totalActiveTrial = activeTrialUsers.length;
    
    let sumXp = 0;
    const levelsMap: Record<string, number> = {};
    
    profilesList.forEach(p => {
      sumXp += (p.xp || 0);
      const lvl = p.level || 'A2';
      levelsMap[lvl] = (levelsMap[lvl] || 0) + 1;
    });

    const avgXp = totalUsers ? Math.round(sumXp / totalUsers) : 0;
    
    return {
      totalUsers,
      totalPaid,
      totalActiveTrial,
      avgXp,
      levelsMap
    };
  }, [profilesList, activePaidUsers, activeTrialUsers]);

  const otherAdminEmail = user.uid === ADMIN_UIDS[0] ? 'admin2@innoknow.mn' : 'admin1@innoknow.mn';

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Admin Header Context Banner */}
        <header className="bg-slate-900 text-white rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-6">
          <div className="z-10 flex items-center gap-5 text-left">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                System Administrator Portal
              </span>
              <h1 className="text-3xl font-black italic font-serif text-white tracking-tight mt-1.5">
                INNOKNOW Operations
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Currently Logged: <strong className="text-indigo-400">{profile?.displayName || user.email}</strong> • ID: <span className="font-mono">{user.uid}</span>
              </p>
            </div>
          </div>

          <div className="z-10 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-xs space-y-1.5 text-left max-w-sm">
            <p className="font-bold text-emerald-300 uppercase tracking-widest text-[9px]">💡 СУРГАЛТЫН ЭРХ ИДЭВХЖҮҮЛЭХ ЗААВАР</p>
            <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
              Хэрэглэгчийн хүсэлтийг зөвшөөрөхөд ердөө <span className="text-emerald-300 font-black">1 админы баталгаажуулалт</span> хангалттай бөгөөд эрх нь шууд хязгааргүй суралцахаар идэвхжинэ.
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl translate-x-20 translate-y-20" />
        </header>

        {/* Dynamic Aggregated Indicators Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Total Registered</p>
            <p className="text-3xl font-black text-zinc-900">{parsedStats.totalUsers} users</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Pending Requests</p>
            <p className="text-3xl font-black text-violet-600">{requests.length} requests</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Active Paid Users</p>
            <p className="text-3xl font-black text-emerald-500">{parsedStats.totalPaid} active</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Active Trial Users</p>
            <p className="text-3xl font-black text-amber-500">{parsedStats.totalActiveTrial} trials</p>
          </div>
        </div>

        {/* Main Tab bar */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeSubTab === 'pending' ? 'border-[#58007E] text-[#58007E]' : 'border-transparent text-zinc-400 hover:text-zinc-800'}`}
          >
            Pending Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('active')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeSubTab === 'active' ? 'border-[#58007E] text-[#58007E]' : 'border-transparent text-zinc-400 hover:text-zinc-800'}`}
          >
            Active Users ({activePaidUsers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('trials')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeSubTab === 'trials' ? 'border-[#58007E] text-[#58007E]' : 'border-transparent text-zinc-400 hover:text-zinc-800'}`}
          >
            Trial Users ({activeTrialUsers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeSubTab === 'stats' ? 'border-[#58007E] text-[#58007E]' : 'border-transparent text-zinc-400 hover:text-zinc-800'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'feedback' ? 'border-[#58007E] text-[#58007E]' : 'border-transparent text-zinc-400 hover:text-zinc-800'}`}
          >
            <span>Санал хүсэлт</span>
            {unreadFeedbackCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadFeedbackCount}
              </span>
            )}
          </button>
        </div>

        {/* Tabs Render Outcomes */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'pending' && (
              <motion.div
                key="pending-requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {requests.length === 0 ? (
                  <div className="p-20 text-center bg-white border border-zinc-100 rounded-[40px] shadow-sm">
                    <UserCheck className="mx-auto text-zinc-300 w-16 h-16 mb-4" />
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No pending join requests.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {requests.map((req: any) => {
                      const accepts = req.accepts || [];
                      
                      // Identify current admin statuses
                      const admin1Accepted = accepts.includes(ADMIN_UIDS[0]);
                      const admin2Accepted = accepts.includes(ADMIN_UIDS[1]);
                      const userAlreadyAccepted = accepts.includes(user.uid);

                      return (
                        <div 
                          key={req.id}
                          className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[360px]"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-2xl font-black italic font-serif text-zinc-900 leading-none">
                                  {req.userName || req.name || 'Сурагч'}
                                </h3>
                                <p className="text-sm font-bold text-zinc-400 mt-1">
                                  {req.userEmail || req.email || ''}
                                </p>
                              </div>
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded tracking-widest">
                                {req.plan ? `Plan: ${req.plan.toUpperCase()}` : 'Pro Request'}
                              </span>
                            </div>

                            {/* Essential Payment Reference Box */}
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 my-3 text-purple-950 font-bold text-xs flex flex-col gap-1.5 text-left">
                              <span className="text-[9px] uppercase tracking-wider text-[#58007E]/70 font-black">Лавлах код (Гүйлгээний утга):</span>
                              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                <span className="font-mono bg-purple-200/55 text-[#58007E] px-2 py-0.5 rounded text-xs font-black">
                                  {req.paymentRef || 'user_ref'}
                                </span>
                                <span className="text-xs text-purple-700 font-medium">
                                  requested <strong className="text-[#58007E] font-black">{(req.plan || 'pro').toUpperCase()}</strong> version
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-b border-dashed border-zinc-100 py-4 my-4 space-y-2 text-left">
                              <p className="text-xs text-zinc-500 font-medium">
                                <strong>Хүсэлт гаргасан огноо:</strong> {req.requestedAt || req.submittedAt ? new Date(req.requestedAt || req.submittedAt).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-xs text-zinc-500 font-medium">
                                <strong>Төхөөрөмжийн ID:</strong> <span className="font-mono text-zinc-805 bg-gray-50 px-1.5 py-0.5 rounded text-[11px]">{req.deviceId || 'N/A'}</span>
                              </p>
                            </div>

                            {/* Acceptance Status Notice */}
                            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2 mb-6 text-left">
                              <Check size={14} className="stroke-[3]" />
                              <span>Ердөө 1 админ зөвшөөрөл шаардлагатай (Single admin approval active)</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                            >
                              ❌ Reject
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10"
                            >
                              ✅ Approve & Activate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeSubTab === 'active' && (
              <motion.div
                key="active-users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {activePaidUsers.length === 0 ? (
                  <div className="p-20 text-center bg-white border border-zinc-100 rounded-[40px] shadow-sm">
                    <ShieldCheck className="mx-auto text-zinc-300 w-16 h-16 mb-4" />
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No active paid students.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">User Details</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Level & XP</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Streak</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Expiry status</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium text-xs">
                          {activePaidUsers.map((userProf: any) => {
                            const daysRemain = Math.ceil((new Date(userProf.accessExpiry).getTime() - currentTime) / (1000 * 60 * 60 * 24));
                            const dateFormatted = new Date(userProf.accessExpiry).toLocaleDateString();

                            return (
                              <tr key={userProf.email} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-6">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-zinc-900">{userProf.displayName}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${userProf.plan === 'premium' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                      {userProf.plan}
                                    </span>
                                  </div>
                                  <p className="text-zinc-400 font-bold">{userProf.email}</p>
                                </td>
                                <td className="p-6">
                                  <span className="bg-[#58007E]/5 text-[#58007E] px-2.5 py-1 rounded-md font-black mr-2 uppercase">{userProf.level || 'A2'}</span>
                                  <span className="text-zinc-600 font-bold">{userProf.xp || 100} XP</span>
                                </td>
                                <td className="p-6 text-amber-600 font-bold flex items-center gap-1.5 pt-8">
                                  <Flame size={14} /> {userProf.streak || 0} days
                                </td>
                                <td className="p-6">
                                  <p className="font-extrabold text-zinc-800">{dateFormatted}</p>
                                  <p className="text-emerald-500 font-black tracking-widest text-[9px] mt-0.5 uppercase">
                                    {daysRemain} days remaining
                                  </p>
                                </td>
                                <td className="p-6 text-right space-x-2">
                                  <button
                                    onClick={() => handleExtendAccess(userProf.uid, userProf.email, 30)}
                                    className="px-3 py-1.5 bg-zinc-100 hover:bg-[#58007E] hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all cursor-pointer"
                                  >
                                    +30 Days
                                  </button>
                                  <button
                                    onClick={() => handleRevokeAccess(userProf.uid, userProf.email)}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 transition-all cursor-pointer"
                                  >
                                    Revoke
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
              </motion.div>
            )}

            {activeSubTab === 'trials' && (
              <motion.div
                key="trial-users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {activeTrialUsers.length === 0 ? (
                  <div className="p-20 text-center bg-white border border-zinc-100 rounded-[40px] shadow-sm">
                    <Clock className="mx-auto text-zinc-300 w-16 h-16 mb-4" />
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">No active trials ongoing.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Ref</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Fingerprinted Device ID</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Trial Started</th>
                            <th className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-wider text-right">Time Countdown</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium text-xs">
                          {activeTrialUsers.map((p: any) => {
                            const endMs = new Date(p.trialEnd || p.trialExpiry).getTime();
                            const remainMs = endMs - currentTime;
                            let tickerText = 'Ended';
                            
                            if (remainMs > 0) {
                              const d = Math.floor(remainMs / (1000 * 60 * 60 * 24));
                              const hr = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                              const mn = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                              const sc = Math.floor((remainMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
                              tickerText = d > 0 ? `${d} өдөр ${hr}:${mn}:${sc}` : `${hr}:${mn}:${sc}`;
                            }

                            return (
                              <tr key={p.email} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-6 font-extrabold text-[#58007E]">{p.email}</td>
                                <td className="p-6 font-mono text-[11px] text-zinc-500">{p.deviceId || 'N/A'}</td>
                                <td className="p-6 text-zinc-400 font-bold">{p.trialStart ? new Date(p.trialStart).toLocaleString() : 'N/A'}</td>
                                <td className="p-6 text-right">
                                  <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-black font-mono shadow-sm">
                                    ⏳ {tickerText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSubTab === 'stats' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Secondary stats 1 */}
                <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">Platform Engagement</h4>
                    <p className="text-xs text-zinc-500 font-semibold leading-relaxed">The mathematical mean points (XP) of students registered on INNOKNOW Prep:</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-[#58007E] font-serif italic mt-4">{parsedStats.avgXp} XP</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Average XP per account</p>
                  </div>
                </div>

                {/* Secondary stats 2 - Level distribution */}
                <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Course Level Distribution</h4>
                  <div className="space-y-3">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => {
                      const count = parsedStats.levelsMap[lvl] || 0;
                      const percentage = parsedStats.totalUsers ? Math.round((count / parsedStats.totalUsers) * 100) : 0;
                      
                      return (
                        <div key={lvl} className="flex items-center justify-between text-xs font-bold text-zinc-700">
                          <span className="w-12">{lvl} Level</span>
                          <div className="flex-1 mx-4 h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                            <div className="bg-[#58007E] h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-16 text-right text-zinc-400">{count} profiles ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'feedback' && (
              <motion.div
                key="feedback-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Filtration bar */}
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#58007E]" />
                    <h3 className="font-bold text-sm text-zinc-800">Санал хүсэлтийн шүүлтүүр</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Type Filter */}
                    <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                      <span className="text-zinc-400 font-bold uppercase">Төрөл:</span>
                      <select
                        value={feedbackTypeFilter}
                        onChange={(e) => setFeedbackTypeFilter(e.target.value)}
                        className="bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-[#58007E]"
                      >
                        <option value="all">Бүгд</option>
                        <option value="suggestion">Санал хүсэлт</option>
                        <option value="bug">Алдаа/Bug</option>
                        <option value="compliment">Талархал</option>
                        <option value="other">Бусад</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                      <span className="text-zinc-400 font-bold uppercase">Төлөв:</span>
                      <select
                        value={feedbackStatusFilter}
                        onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                        className="bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-[#58007E]"
                      >
                        <option value="all">Бүгд</option>
                        <option value="new">Шинэ</option>
                        <option value="read">Уншсан</option>
                        <option value="resolved">Шийдвэрлэсэн</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feedback Entries list */}
                {filteredFeedbacks.length === 0 ? (
                  <div className="p-20 text-center bg-white border border-zinc-100 rounded-[40px] shadow-sm">
                    <MessageSquare className="mx-auto text-zinc-300 w-16 h-16 mb-4" />
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Санал хүсэлт олдсонгүй.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredFeedbacks.map((f: any) => {
                      return (
                        <div
                          key={f.id}
                          className={`bg-white p-6 rounded-[32px] border transition-all shadow-sm flex flex-col justify-between ${
                            f.status === 'new' ? 'border-[#58007E]/30 ring-2 ring-[#58007E]/5' : 'border-zinc-100'
                          }`}
                        >
                          <div>
                            {/* Card Header Info */}
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div>
                                <h4 className="font-extrabold text-[#58007E] text-base leading-tight">{f.userName}</h4>
                                <p className="text-xs text-zinc-500 font-medium">{f.userEmail}</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">
                                  {f.createdAt ? new Date(f.createdAt).toLocaleString('mn-MN') : 'N/A'}
                                </p>
                              </div>
                              
                              {/* Trash/Delete Action */}
                              <button
                                onClick={() => handleDeleteFeedback(f.id)}
                                className="text-zinc-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                                title="Устгах"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Badge Categories */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {f.type === 'bug' && (
                                <span className="bg-red-50 border border-red-200 text-red-600 font-bold uppercase tracking-widest text-[9px] px-2 py-1 rounded-full flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  Алдаа / Bug
                                </span>
                              )}
                              {f.type === 'suggestion' && (
                                <span className="bg-violet-50 border border-violet-200 text-violet-600 font-bold uppercase tracking-widest text-[9px] px-2 py-1 rounded-full flex items-center gap-1">
                                  <Lightbulb size={10} />
                                  Санал хүсэлт
                                </span>
                              )}
                              {f.type === 'compliment' && (
                                <span className="bg-green-50 border border-green-200 text-green-600 font-bold uppercase tracking-widest text-[9px] px-2 py-1 rounded-full flex items-center gap-1">
                                  <Heart size={10} />
                                  Талархал
                                </span>
                              )}
                              {f.type === 'other' && (
                                <span className="bg-gray-50 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-[9px] px-2 py-1 rounded-full flex items-center gap-1">
                                  <HelpCircle size={10} />
                                  Бусад
                                </span>
                              )}

                              {/* Status Badge */}
                              {f.status === 'new' ? (
                                <span className="bg-blue-500 text-white font-extrabold text-[9px] px-2 py-1 rounded-full tracking-wider uppercase animate-pulse">
                                  🔵 Шинэ
                                </span>
                              ) : f.status === 'read' ? (
                                <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 font-extrabold text-[9px] px-2 py-1 rounded-full tracking-wider uppercase">
                                  👁 Уншсан
                                </span>
                              ) : (
                                <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-1 rounded-full tracking-wider uppercase">
                                  ✅ Шийдсэн
                                </span>
                              )}
                            </div>

                            {/* The Message itself */}
                            <div className="bg-zinc-50 p-4 rounded-xl text-xs font-medium text-zinc-700 leading-relaxed max-h-40 overflow-y-auto border border-zinc-100 whitespace-pre-line">
                              {f.message}
                            </div>
                          </div>

                          {/* Quick Admin Actions Box */}
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-50 text-xs">
                            <span className="text-zinc-400 font-black text-[9px] uppercase tracking-wider mr-auto">Төлөв өөрчлөх:</span>
                            {f.status !== 'read' && (
                              <button
                                onClick={() => handleChangeFeedbackStatus(f.id, 'read')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg transition-all active:scale-95 text-[11px] cursor-pointer"
                              >
                                Уншсан болгох
                              </button>
                            )}
                            {f.status !== 'resolved' && (
                              <button
                                onClick={() => handleChangeFeedbackStatus(f.id, 'resolved')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-all active:scale-95 text-[11px] cursor-pointer"
                              >
                                Шийдсэн болгох
                              </button>
                            )}
                            {f.status !== 'new' && (
                              <button
                                onClick={() => handleChangeFeedbackStatus(f.id, 'new')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-all active:scale-95 text-[11px] cursor-pointer"
                              >
                                Шинэ болгох
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

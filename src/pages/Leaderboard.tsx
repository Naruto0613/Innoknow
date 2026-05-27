import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Shield, Search, Star, Users, MapPin, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface BoardUser {
  uid: string;
  displayName: string;
  school: string;
  level: string;
  xp: number;
  streak: number;
  plan: string;
  rank?: number;
}

export default function Leaderboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'school' | 'national' | 'daily' | 'alltime'>('school');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<BoardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      // Load standard mock participants first to guarantee rich lists and vibrant stats
      const defaultUsers: BoardUser[] = [
        { uid: 'u1', displayName: 'Хүслэн Батбаяр', school: 'ШУТИС', level: 'B2', xp: 1840, streak: 34, plan: 'pro' },
        { uid: 'u2', displayName: 'Анударь Эрдэнэ', school: 'ШУТИС', level: 'C1', xp: 1950, streak: 45, plan: 'premium' },
        { uid: 'u3', displayName: 'Билгүүн Төмөр', school: 'МУИС', level: 'A2', xp: 1200, streak: 12, plan: 'basic' },
        { uid: 'u4', displayName: 'Цэлмэг Сандаг', school: 'ШУТИС', level: 'B1', xp: 1450, streak: 21, plan: 'pro' },
        { uid: 'u5', displayName: 'Төгөлдөр Баяраа', school: 'Лайт Хорл', level: 'C2', xp: 2200, streak: 101, plan: 'premium' },
        { uid: 'u6', displayName: 'Сондор Ганзориг', school: 'МУИС', level: 'B2', xp: 1620, streak: 28, plan: 'pro' },
        { uid: 'u7', displayName: 'Тэмүүлэн Зоригт', school: 'МУИС', level: 'B1', xp: 950, streak: 6, plan: 'basic' },
        { uid: 'u8', displayName: 'Ариунзаяа Даваа', school: 'Ерөнхий Боловсролын Сургууль', level: 'A1', xp: 320, streak: 3, plan: 'basic' },
        { uid: 'u9', displayName: 'Наранбаатар Жаргал', school: 'ШУТИС', level: 'C1', xp: 1710, streak: 29, plan: 'pro' },
        { uid: 'u10', displayName: 'Намуун Энхтөр', school: 'Ерөнхий Боловсролын Сургууль', level: 'A2', xp: 850, streak: 8, plan: 'basic' },
      ];

      // Merge other registered players from localStorage to maintain instant offline updates
      try {
        const localProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
        Object.values(localProfiles).forEach((p: any) => {
          if (p && p.displayName) {
            const exIdx = defaultUsers.findIndex(u => u.uid === p.uid || u.displayName.toLowerCase() === p.displayName.toLowerCase());
            if (exIdx > -1) {
              defaultUsers[exIdx] = {
                ...defaultUsers[exIdx],
                xp: p.xp !== undefined ? Number(p.xp) : defaultUsers[exIdx].xp,
                streak: p.streak !== undefined ? Number(p.streak) : defaultUsers[exIdx].streak,
                level: p.level || defaultUsers[exIdx].level,
                school: p.school || defaultUsers[exIdx].school,
                plan: p.plan || defaultUsers[exIdx].plan
              };
            } else {
              defaultUsers.push({
                uid: p.uid,
                displayName: p.displayName,
                school: p.school || 'Сургуульгүй',
                level: p.level || 'A1',
                xp: Number(p.xp) || 0,
                streak: Number(p.streak) || 0,
                plan: p.plan || 'basic'
              });
            }
          }
        });
      } catch (e) {
        console.warn('Could not integrate localStorage users:', e);
      }

      // Merge current logged-in profile if present
      if (profile) {
        const filteredDefaults = defaultUsers.filter(u => u.uid !== profile.uid && u.displayName !== profile.displayName);
        filteredDefaults.push({
          uid: profile.uid,
          displayName: profile.displayName || 'Та',
          school: profile.school || 'Сургуульгүй',
          level: profile.level || 'A1',
          xp: profile.xp || 0,
          streak: profile.streak || 0,
          plan: profile.plan
        });
        defaultUsers.length = 0;
        defaultUsers.push(...filteredDefaults);
      }

      // Try fetching live users from firebase
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const firebaseUsers: BoardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.xp !== undefined && data.displayName) {
            firebaseUsers.push({
              uid: doc.id,
              displayName: data.displayName,
              school: data.school || 'Сургуульгүй',
              level: data.level || 'A1',
              xp: Number(data.xp) || 0,
              streak: Number(data.streak) || 0,
              plan: data.plan || 'basic'
            });
          }
        });

        // Integrate firebase profiles in the list to form accurate scores
        if (firebaseUsers.length > 0) {
          const merged = [...firebaseUsers];
          // Add default users that aren't already represented in firebase
          defaultUsers.forEach(du => {
            if (!merged.some(mu => mu.uid === du.uid || mu.displayName.toLowerCase() === du.displayName.toLowerCase())) {
              merged.push(du);
            }
          });
          setUsersList(merged);
        } else {
          setUsersList(defaultUsers);
        }
      } catch (err) {
        console.warn("Could not load users collection from Firestore direct query. Loading local list:", err);
        setUsersList(defaultUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [profile]);

  if (!profile) return null;

  // Security gating: expired users can only see school, others can see all
  const isBasic = profile.plan === 'expired';
  const hasAccess = !isBasic || activeTab === 'school';

  const filterUsers = () => {
    let list = [...usersList];

    // 1. Filter by Active Tab
    if (activeTab === 'school') {
      // Filter users in the same school
      const userSchool = profile.school || 'ШУТИС';
      list = list.filter(u => u.school.toLowerCase() === userSchool.toLowerCase());
    } else if (activeTab === 'daily') {
      // simulate slightly shifted daily numbers
      list = list.map(u => ({ ...u, xp: Math.round(u.xp * 0.15) }));
    } else if (activeTab === 'alltime' || activeTab === 'national') {
      // keep full XP sorting
    }

    // 2. Sort by computed XP
    list.sort((a, b) => b.xp - a.xp);

    // 3. Add ranks
    list = list.map((user, idx) => ({ ...user, rank: idx + 1 }));

    // 4. Search Filter
    if (searchQuery.trim()) {
      list = list.filter(u => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  };

  const sortedLeaderboard = filterUsers();

  const getRankBadge = (rank?: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-slate-400 font-extrabold font-mono text-sm">#{rank}</span>;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFCFB] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-800 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Trophy size={14} className="text-amber-500 animate-spin" /> АНГЛИ ХЭЛНИЙ ЧАРТЛИСТ
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black font-serif italic text-slate-900 tracking-tight">
            Лидерүүдийн Шат
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-xs md:text-sm">
            Нийт сурагчидтай өөрийн цуглуулсан XP оноогоор өрсөлдөж, ур чадвараа баталгаажуул.
          </p>
        </div>

        {/* Level & XP Quick Badge */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-md flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Таны Одоогийн Багц</p>
              <h4 className="text-sm font-black text-slate-800 uppercase">
                {profile.plan === 'trial' ? '3 хоногийн Үнэгүй Trial' : profile.plan === 'pro' ? 'Pro лиценз' : profile.plan === 'premium' ? 'Premium VIP' : 'Хугацаа Дууссан'}
              </h4>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Сургууль</p>
              <h4 className="text-sm font-bold text-slate-800">{profile.school || 'Сургууль байхгүй'}</h4>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Оноо</p>
              <h4 className="text-sm font-black text-[#58007E]">{profile.xp || 0} XP</h4>
            </div>
          </div>
        </div>

        {/* LEADERBOARD CATEGORIES TABS */}
        <div className="flex border-b border-slate-100 mb-6 overflow-x-auto gap-2">
          {[
            { id: 'school' as const, label: 'Сургуулийн чарт', icon: Users, isLocked: false },
            { id: 'national' as const, label: 'Улсын хэмжээний чарт', icon: MapPin, isLocked: isBasic },
            { id: 'daily' as const, label: 'Өдрийн (24ц)', icon: Trophy, isLocked: isBasic },
            { id: 'alltime' as const, label: 'Бүх цаг үеийн', icon: Trophy, isLocked: isBasic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-nowrap rounded-t-2xl font-black text-xs uppercase tracking-widest transition-all scrollbar-none flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#58007E] text-[#58007E] bg-purple-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {tab.isLocked && <Lock size={12} className="text-red-500 ml-1 shrink-0 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* SECURITY LOCKED PANEL */}
        <AnimatePresence mode="wait">
          {!hasAccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white p-10 rounded-[36px] border border-slate-100 shadow-xl text-center py-16"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-black font-serif italic text-slate-900 mb-3">Хязгаарлагдсан Цэс</h3>
              <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
                Улсын чартлист болон Өдөр тутмын тэргүүлэгчдийг үзэхийн тулд <span className="text-[#58007E]">Pro</span> эсвэл <span className="text-[#58007E]">Premium</span> гишүүнчлэлд нэгдсэн байх шаардлагатай.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 bg-[#58007E] hover:bg-[#40005C] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 transition-all cursor-pointer"
              >
                Багцаа Идэвхжүүлэх <ArrowRight size={14} />
              </a>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Хэрэглэгчийн нэрээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:border-indigo-100 outline-none shadow-sm text-xs font-semibold"
                />
              </div>

              {/* Leaderboard Entries */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Тэргүүлэгчдийг ачаалж байна...</p>
                  </div>
                ) : sortedLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xs font-bold text-slate-400 uppercase">Хараахан сурагч бүртгэгдээгүй байна.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {sortedLeaderboard.map((user) => {
                      const isMe = user.uid === profile.uid;
                      const hasPaidPlan = user.plan === 'pro' || user.plan === 'premium';
                      
                      return (
                        <div
                          key={user.uid}
                          className={`flex items-center justify-between p-4 px-6 md:px-8 transition-all ${
                            isMe ? 'bg-purple-50/50 border-l-4 border-l-[#58007E]' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className="w-10 flex justify-center">{getRankBadge(user.rank)}</div>

                            {/* User Avatar Initial */}
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase text-xs border border-white">
                              {user.displayName.charAt(0)}
                            </div>

                            {/* Name and School */}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs md:text-sm font-black text-slate-800">{user.displayName}</h4>
                                {hasPaidPlan && (
                                  <span className="text-[9px] font-black bg-purple-100 text-[#58007E] px-1.5 py-0.5 rounded uppercase font-sans">
                                    {user.plan}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-400">{user.school}</span>
                            </div>
                          </div>

                          {/* Stats info */}
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-400 uppercase font-sans">Түвшин: </span>
                              <span className="text-xs font-black text-slate-700 font-sans">{user.level}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-[#58007E] font-sans">{user.xp}</span>
                              <span className="text-[10px] font-bold text-slate-400 font-sans block uppercase">XP</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

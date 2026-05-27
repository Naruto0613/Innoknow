import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ADMIN_UIDS, isUserAdmin } from '../hooks/useAuth';
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, Shield, Languages, PenTool, Trophy, Swords, Award, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(true);
  const [mobileBattleOpen, setMobileBattleOpen] = useState(true);
  const [mobileExtrasOpen, setMobileExtrasOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const lessonsItems = [
    { name: 'Courses', desc: 'Цогц сургалтууд', path: '/courses', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
    { name: 'Grammar', desc: 'Дүрмийн тайлбарууд', path: '/grammar', icon: PenTool, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Vocabulary', desc: 'Үг цээжлэх карт', path: '/vocabulary', icon: Languages, color: 'text-pink-600 bg-pink-50' },
    { name: 'IELTS Prep', desc: 'IELTS бэлтгэл сургалт', path: '/ielts', icon: GraduationCap, color: 'text-rose-500 bg-rose-50', hot: true },
  ];

  const battleItems = [
    { name: 'Level Test', desc: 'Түвшин тогтоох сорил', path: '/level-test', icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Battle Arena', desc: 'Дуэлийн сонирхолтой талбар', path: '/battle', icon: Swords, color: 'text-violet-600 bg-violet-50', live: true },
    { name: 'Leaderboard', desc: 'Шилдэг топ сурагчид', path: '/leaderboard', icon: Trophy, color: 'text-amber-500 bg-amber-50' },
  ];

  const extrasItems = [
    { name: 'Certificates', desc: 'Амжилтын батламж', path: '/certificates', icon: Award, color: 'text-teal-600 bg-teal-50' },
    { name: 'Premium Plans', desc: 'Сургалтын багцууд', path: '/pricing', icon: Sparkles, color: 'text-blue-600 bg-blue-50' },
  ];

  // --- CUSTOM LOGO CONFIGURATION ---
  // To use your own image logo:
  // 1. Download your image and save it as "logo.png" (or "logo.svg")
  // 2. Put it inside the "/public/" directory of your project
  // 3. Change "useCustomImageLogo" below to true
  const useCustomImageLogo = true; // Set to true when you upload your image!
  const logoSrc = "../../public/logo.png"; // Set the filename of your logo image here

  const Logo = () => (
    <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
      <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
        {useCustomImageLogo ? (
          <img 
            src={logoSrc} 
            alt="INNOKNOW Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              console.warn("Custom logo image could not be loaded from: " + logoSrc);
            }}
          />
        ) : (
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full text-[#58007E]" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* LEFT SIDE: 'I' curved monogram part */}
            <path d="M 45,12 A 38,38 0 0,0 17.1,31 L 22,33 Q 29,32 36,26 V 74 Q 29,68 22,67 L 17.1,69 A 38,38 0 0,0 45,88 L 45,80 Q 43,80 41,74 V 26 Q 43,20 45,20 L 45,12 Z" />

            {/* RIGHT SIDE: 'K' curved monogram part with calligraphic cleft */}
            <path d="M 55,12 A 38,38 0 0,1 82.9,31 L 78,33 Q 70,41 62,50 Q 70,59 78,67 L 82.9,69 A 38,38 0 0,1 55,88 V 12 Z" />
          </svg>
        )}
      </div>
      <span className="font-bold text-2xl tracking-tighter text-zinc-900 italic font-serif">INNOKNOW</span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {/* Lessons Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveMenu('lessons')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#58007E] transition-all py-2 cursor-pointer">
              Lessons
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'lessons' ? 'rotate-180 text-[#58007E]' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'lessons' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 mt-1 grid gap-1.5 z-50"
                >
                  {lessonsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-[#58007E] transition-colors">{item.name}</span>
                          {item.hot && (
                            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[7px] font-black rounded uppercase tracking-wider">Hot</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Battle/Comp Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveMenu('battle')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#58007E] transition-all py-2 cursor-pointer">
              Arena
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'battle' ? 'rotate-180 text-[#58007E]' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'battle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 mt-1 grid gap-1.5 z-50"
                >
                  {battleItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-[#58007E] transition-colors">{item.name}</span>
                          {item.live && (
                            <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] font-black rounded uppercase tracking-wider animate-pulse">Live</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Extras Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveMenu('extras')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#58007E] hover:text-[#40005C] transition-all py-2 cursor-pointer">
              Explore
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'extras' ? 'rotate-180 text-[#58007E]' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'extras' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 mt-1 grid gap-1.5 z-50"
                >
                  {extrasItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-[#58007E] transition-colors">{item.name}</span>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user && isUserAdmin(user) && (
            <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5">
              <Shield size={12} className="text-amber-600" /> Admin
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-6 border-l border-zinc-100 pl-8 ml-2">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-bold text-zinc-900">{profile?.displayName || user.email}</span>
                 <span className="text-[10px] font-black text-[#58007E] uppercase tracking-widest">{profile?.level || 'A1'} Level</span>
              </div>
              <Link to="/dashboard" className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-[#58007E] hover:bg-white hover:shadow-xl rounded-xl transition-all">
                 <LayoutDashboard size={18} />
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-[10px] font-black text-zinc-400 hover:text-red-500 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              <Link to="/login" className="text-[10px] font-black text-zinc-500 hover:text-zinc-900 uppercase tracking-widest">Sign In</Link>
              <Link to="/signup" className="text-[11px] font-black bg-[#58007E] text-white px-8 py-3.5 rounded-2xl hover:bg-[#40005C] transition-all shadow-xl shadow-[#58007E]/20 uppercase tracking-widest">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-white border-b border-[#14141410] p-5 flex flex-col gap-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Lessons Section */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setMobileLessonsOpen(!mobileLessonsOpen)}
              className="flex items-center justify-between w-full text-[10px] font-black tracking-widest text-zinc-400 uppercase text-left border-b border-zinc-100 pb-2 mb-1"
            >
              <span>Lessons (Хичээлүүд)</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileLessonsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileLessonsOpen && (
              <div className="grid gap-2 pl-1.5">
                {lessonsItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-3 py-1.5 text-zinc-600 hover:text-[#58007E]"
                  >
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-zinc-800">{item.name}</span>
                        {item.hot && (
                          <span className="px-1 py-0.2 bg-rose-500 text-white text-[6px] font-black rounded uppercase">Hot</span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Arena Section */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setMobileBattleOpen(!mobileBattleOpen)}
              className="flex items-center justify-between w-full text-[10px] font-black tracking-widest text-zinc-400 uppercase text-left border-b border-zinc-100 pb-2 mb-1"
            >
              <span>Arena (Тулаан)</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileBattleOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileBattleOpen && (
              <div className="grid gap-2 pl-1.5">
                {battleItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-3 py-1.5 text-zinc-600 hover:text-[#58007E]"
                  >
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-zinc-800">{item.name}</span>
                        {item.live && (
                          <span className="px-1 py-0.2 bg-emerald-500 text-white text-[6px] font-black rounded uppercase animate-pulse">Live</span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* More Section */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setMobileExtrasOpen(!mobileExtrasOpen)}
              className="flex items-center justify-between w-full text-[10px] font-black tracking-widest text-zinc-400 uppercase text-left border-b border-zinc-100 pb-2 mb-1"
            >
              <span>Explore (Нэмэлт)</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileExtrasOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileExtrasOpen && (
              <div className="grid gap-2 pl-1.5">
                {extrasItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-3 py-1.5 text-zinc-600 hover:text-[#58007E]"
                  >
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-800">{item.name}</span>
                      <p className="text-[9px] text-zinc-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Block in Mobile */}
          <div className="border-t border-zinc-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100/70 transition-colors"
                >
                  <div className="flex flex-col text-left">
                     <span className="text-xs font-bold text-zinc-900">{profile?.displayName || user.email}</span>
                     <span className="text-[10px] font-black text-[#58007E] uppercase tracking-widest mt-0.5">{profile?.level || 'A1'} Level</span>
                  </div>
                  <LayoutDashboard size={18} className="text-[#58007E]" />
                </Link>
                {user && isUserAdmin(user) && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[10px] font-black uppercase text-amber-700 tracking-wider"
                  >
                    <span>Admin Panel</span>
                    <Shield size={16} className="text-amber-600" />
                  </Link>
                )}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }} 
                  className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-[11px] uppercase tracking-wider text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)} 
                  className="py-3.5 text-center border border-zinc-200 text-zinc-700 rounded-xl font-extrabold text-[11px] uppercase tracking-wider hover:bg-zinc-50"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsOpen(false)} 
                  className="py-3.5 text-center bg-[#58007E] text-white rounded-xl font-extrabold text-[11px] uppercase tracking-wider hover:bg-[#40005C] shadow-lg shadow-[#58007E]/20"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

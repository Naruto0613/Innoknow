import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Sparkles, Brain, ArrowRight, GraduationCap } from 'lucide-react';
import PlacementTest from '../components/PlacementTest';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlacementTest, setShowPlacementTest] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password.trim() || !school.trim()) {
      setError("Бүх талбарыг бүрэн бөглөнө үү");
      return;
    }

    if (password.length < 5) {
      setError("Нууц үг дор хаяж 5 тэмдэгт байх ёстой");
      return;
    }

    // Trigger placement assessment test first!
    setShowPlacementTest(true);
  };

  const handlePlacementComplete = async (determinedLevel: string) => {
    setShowPlacementTest(false);
    setLoading(true);
    setError('');
    
    try {
      // Direct signup with 24h trial automatic!
      await signup(email, password, name, determinedLevel, school);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#FDFCFB]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-[48px] shadow-2xl shadow-indigo-100 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#58007E] rounded-2xl mx-auto flex items-center justify-center text-white font-black text-3xl mb-4 italic shadow-lg shadow-[#58007E]/20">I</div>
          <h2 className="text-3xl font-black italic font-serif tracking-tight text-slate-900">
            Create Account
          </h2>
          <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-[0.2em]">
            Get 24-Hour Free Trial Automatically
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 uppercase tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
                placeholder="Setsen Naran"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Сургуулийн нэр / Сургууль</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
                placeholder="МУИС эсвэл Ерөнхий боловсролын сургуулийн нэр"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
                placeholder="you@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#58007E] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#40005C] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? 'Creating account...' : <><Brain size={18} /> Take Assessment & Join</>}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Joined before? <Link to="/login" className="text-indigo-600 font-extrabold hover:underline">Sign In</Link>
        </p>

        {/* Modal Placement Test */}
        <AnimatePresence>
          {showPlacementTest && (
            <PlacementTest 
              onComplete={handlePlacementComplete} 
              onCancel={() => setShowPlacementTest(false)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

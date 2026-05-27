import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Trophy, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <section className="relative w-full h-screen flex justify-center items-center pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#58007E]/10 px-4 py-2 rounded-full text-[#58007E] font-bold text-sm mb-6">
              <Star size={16} fill="currentColor" />
              <span>Personalized English Learning</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 italic">
              Empower Your <span className="text-[#58007E]">English</span> Journey with INNOKNOW.
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-lg leading-relaxed">
              The smart way to learn English tailored for Mongolian students. Master grammar, vocabulary, and exam prep with AI assistance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses" className="bg-[#58007E] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#40005C] transition-all flex items-center gap-2 shadow-xl shadow-[#58007E]/20">
                Start Learning <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="bg-white border-2 border-zinc-100 text-zinc-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-zinc-300 transition-all">
                Learn More
              </Link>
            </div>
          </motion.div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-zinc-100 hidden md:block"
            >
            </motion.div>
        </div>
      </section>
      <section className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-900">What are you looking for today?</h2>
            <p className="text-zinc-500">Quickly jump into your favorite sections.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Courses', icon: BookOpen, path: '/courses', color: 'bg-blue-500', desc: 'Personalized lessons for all levels' },
              { title: 'Grammar', icon: GraduationCap, path: '/grammar', color: 'bg-[#58007E]', desc: 'AI-powered grammar explanations' },
              { title: 'Level Test', icon: Trophy, path: '/level-test', color: 'bg-amber-500', desc: 'Discover your current proficiency' },
              { title: 'IELTS Prep', icon: Star, path: '/ielts', color: 'bg-red-500', desc: 'Specialized exam training' }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path}
                className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 ${item.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 mb-6">{item.desc}</p>
                <div className="flex items-center text-zinc-400 text-[10px] font-black uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                  Open Section <ArrowRight size={14} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

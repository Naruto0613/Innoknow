import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MessageSquare, BarChart3, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              AI-Powered English Learning
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tighter text-slate-900">
              Master English <br />
              <span className="text-indigo-600 italic font-serif leading-tight">with INNOKNOW.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
              Experience the future of speaking practice. Our AI tutors provide instant feedback, personalized paths, and precise tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="group bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                Start Learning for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/ielts" className="px-8 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-center hover:bg-slate-50 transition-colors text-slate-700">
                Practice IELTS
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-indigo-900 rounded-[48px] relative overflow-hidden flex items-center justify-center p-8 shadow-2xl">
              {/* Abstract decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border-2 border-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">AI Feedback</div>
                    <div className="text-sm font-bold">"Excellent pronunciation!"</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 1 }}
                      className="h-full bg-green-500"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>ACCURACY: 85%</span>
                    <span>LEVEL: B2+</span>
                  </div>
                </div>
              </div>

              {/* Floaties */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-10 bg-white p-4 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center"><Globe size={16} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Practice Daily</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="bg-white py-24 border-y border-[#14141405]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 italic font-serif tracking-tight text-slate-900">Built for modern learners.</h2>
            <p className="text-slate-500 font-medium">Practice makes perfect. AI makes it focused.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'AI Tutors', desc: 'Real-time conversations with intelligent tutors that understand your context.', color: 'bg-indigo-50 text-indigo-600' },
              { icon: BarChart3, title: 'Deep Analytics', desc: 'Detailed breakdown of your speaking, listening, and grammar progress.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Sparkles, title: 'Personalized Path', desc: 'Courses that adapt to your speed and level from A1 to C2.', color: 'bg-violet-50 text-violet-600' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-xs font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Choose your path.</h2>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
              Start where you are. Our adaptive curriculum covers everything from basic vocabulary to advanced professional proficiency.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                <div key={level} className="p-4 border border-slate-100 rounded-2xl text-center font-bold text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 cursor-pointer transition-all shadow-sm">
                  {level}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <img src="https://picsum.photos/seed/learn/400/500" alt="Learning" className="rounded-3xl shadow-xl w-full" referrerPolicy="no-referrer" />
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
                <h4 className="text-3xl font-bold mb-2 italic">95%</h4>
                <p className="text-sm font-semibold opacity-80 leading-snug">Success rate for students reaching their goal within 6 months.</p>
              </div>
            </div>
            <div className="space-y-4">
               <div className="bg-amber-400 p-8 rounded-3xl text-slate-900 shadow-xl shadow-amber-100">
                <h4 className="text-3xl font-extrabold mb-2 italic font-serif">IELTS Prep</h4>
                <p className="text-sm font-bold opacity-90 leading-snug">Specialized band-focused training for all sections.</p>
              </div>
              <img src="https://picsum.photos/seed/practice/400/400" alt="Practice" className="rounded-3xl shadow-xl w-full" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

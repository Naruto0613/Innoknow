import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, MessageSquare, BarChart3, Heart, Shield, Zap, Contact, Github, Users, Award } from 'lucide-react';

export default function Landing() {

  return (
    <div className="overflow-hidden bg-[#FDFCFB]">
      
      {/* 1. Centered Hero Section (STRICT: NO IMAGE in the hero, centered text & buttons) */}
      <section className="relative pt-28 pb-36 px-4 md:px-8 max-w-5xl mx-auto text-center">
        
        {/* Subtle glowing halo banner at background center */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#58007E] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" />
            ХИЙМЭЛ ОЮУНД СУУРИЛСАН АНГЛИ ХЭЛНИЙ ИРЭЭДҮЙ
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900 font-serif">
            Англи хэлийг ухаалгаар <br />
            <span className="text-[#58007E] italic leading-tight">INNOKNOW-оор эзэмшинэ.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold">
            Түвшин бүрт зориулсан 50 өвөрмөц сорилт, унших, сонсох, ярих болон бичих дасгалууд. Тэргүүлэгчдийн жагсаалтанд өрсөлдөн ахицаа шууд ажигла.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="group bg-[#58007E] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              Үнэгүй Үзэж Эхлэх
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/pricing" 
              className="px-8 py-5 rounded-2xl border border-slate-200 bg-white font-black text-xs uppercase tracking-widest text-[#58007E] hover:bg-slate-50 transition-colors"
            >
              Үнийн Санал Үзэх
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. Features Grid */}
      <section className="bg-white py-24 border-y border-[#14141405]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-3 italic font-serif tracking-tight text-slate-900">Манай Давуу Талууд</h2>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Хиймэл оюуны шийдлээр хурдан ахиц</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: 'AI Ярианы Багш (Speaking Coach)', desc: 'Таны дуу хоолой болон дуудлагыг сонсонгуут дүрэм болон үгсийн сангийн зөвлөгөөг шууд өгнө.', color: 'bg-purple-50 text-[#58007E]' },
              { icon: BarChart3, title: 'Лидерийн Шат (Real Leaderboard)', desc: 'Бусад сурагчидтай цуглуулсан XP оноогоор бодит цагт өрсөлдөн, суралцах идэвхээ нэмэгдүүлнэ.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Sparkles, title: '50 Сорилт Хичээл', desc: 'Унших, Сонсох, Бичих, Ярих бүрд 50 бүрэн шалгалт бүхий дадлагыг зөвхөн өөрийн түвшиндээ хийнэ.', color: 'bg-amber-50 text-amber-600' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all text-center flex flex-col items-center justify-center animate-fade-in"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-sm font-black mb-3 text-slate-900 uppercase tracking-tight text-center">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-xs font-semibold text-center">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Level Guide Path */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-3 italic font-serif tracking-tight text-slate-900">Бүх Түвшинд Тохирох Сонголтууд</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-semibold text-xs md:text-sm leading-relaxed">
            Та анхан шатнаас ахисан шат хүртэлх бүх түвшний хичээлийг сонгож үзэх боломжтой.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { tag: 'A1', name: 'Beginner', desc: 'Энгийн өдөр тутмын үгс' },
            { tag: 'A2', name: 'Elementary', desc: 'Өгүүлбэр, өнгөрсөн цаг' },
            { tag: 'B1', name: 'Intermediate', desc: 'Идэвхтэй харилцан яриа' },
            { tag: 'B2', name: 'Upper-Inter', desc: 'Мэргэжлийн болон эссе' },
            { tag: 'C1', name: 'Advanced', desc: 'Эрдэм шинжилгээний анализ' },
            { tag: 'C2', name: 'Proficient', desc: 'Чөлөөтэй сэтгэн бодох' }
          ].map((lvl) => (
            <div key={lvl.tag} className="p-6 border border-slate-100 rounded-3xl text-center bg-white shadow-sm hover:border-purple-300 hover:shadow-md transition-all">
              <span className="w-10 h-10 rounded-full bg-purple-50 text-[#58007E] font-black text-sm flex items-center justify-center mx-auto mb-3">
                {lvl.tag}
              </span>
              <h4 className="text-xs font-black text-slate-800">{lvl.name}</h4>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About Us bottom Section (STRICT: Teammate Photos, Detailed About Us, Disclosures on Click) */}
      <section id="about-us" className="bg-[#FAF9F6] py-24 border-t border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-800 text-[9px] font-black uppercase tracking-widest mb-3"
            >
              <Users size={12} /> БИДНИЙ ТУХАЙ
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black font-serif italic text-slate-900 tracking-tight">
              Бүтээгч Баг Хамт Олон
            </h2>
            <p className="text-slate-500 font-semibold text-xs md:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              Монголын англи хэлний сургалтын стандартыг цоо шинэ түвшинд аваачихаар зорин ажиллаж буй манай хөгжүүлэгчид болон багш нартай танилцана уу.
            </p>
          </div>

          {/* Mission statements block */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Heart, t: "Сурагч Чөхөөтэй", d: "Бид хөгжүүлж буй бүх ухаалаг хэрэгслээ сурагчийн хэрэгцээнд хамгийн ээлтэй байлгахаар загварчилдаг." },
              { icon: Shield, t: "Шинжлэх Ухааны Суурьтай", d: "Манай сорилтууд олон улсын IELTS, TOEFL-ийн сорилын стандарт, хэл шинжлэлийн хувийн дүрмүүдэд бат тулгуурладаг." },
              { icon: Zap, t: "Инновацийн Манлайлал", d: "Зөвхөн хамгийн сүүлийн үеийн Gemini AI болон ухаалгаар тохируулсан алгоритмуудыг сургалтанд ашиглаж байна." }
            ].map((st, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 bg-purple-50 text-[#58007E] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <st.icon size={20} />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-800 text-center">{st.t}</h4>
                <p className="text-slate-400 font-semibold text-[11px] leading-relaxed text-center">{st.d}</p>
              </div>
            ))}
          </div>

          <div className="text-center py-6">
            <Link
              to="/about"
              className="bg-[#58007E] hover:bg-[#430060] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-100/50 transition-all inline-flex items-center gap-2 cursor-pointer border-none"
            >
              Дэлгэрэнгүй үзэх (More)
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}

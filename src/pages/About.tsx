import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Shield, Zap, Target, Users, Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

interface Teammate {
  name: string;
  role: string;
  desc: string;
  photoSeed: string;
  details: string;
  email: string;
}

export default function About() {
  const [selectedPartner, setSelectedPartner] = useState<Teammate | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const team: Teammate[] = [
    {
      name: "Батбаяр Бадрал (Badral)",
      role: "Хөгжүүлэлтийн Албаны Дарга (CTO)",
      desc: "Их өгөгдөл, хиймэл оюуны алгоритм хөгжүүлэлтийн чиглэлээр 8 жил ажилласан туршлагатай.",
      photoSeed: "badral",
      details: "МУИС болон ШУТИС-ийн Мэдээллийн Технологийн сургууль төгссөн. INNOKNOW академийн Gemini AI болон яриа гүйцэтгэх системийг хариуцан хөгжүүлсэн эрдэмтэн хөгжүүлэгч.",
      email: "badral@innoknow.mn"
    },
    {
      name: "Наранбадрах (Naranbadrakh)",
      role: "Агуулгын Архитектор (Chief Content Officer)",
      desc: "Англи хэлний түвшин тогтоох IELTS сорилт, сургалтын хөтөлбөрийг хариуцдаг.",
      photoSeed: "naranbadrakh",
      details: "МУИС болон ШУТИС-д суралцаж, олон улсын хэлний чиглэлээр мэргэшсэн. Түвшин бүрт тохирох 50 прогрессив хичээлийг урагшлуулах удирдамжийн загварыг боловсруулсан үүсгэн байгуулагч.",
      email: "naranbadrakh@innoknow.mn"
    },
    {
      name: "Ганболд Номин (Nomin)",
      role: "Бүтээгдэхүүн Төлөвлөгч (Product Manager & UI/UX Designer)",
      desc: "Хэрэглэгчдэд ээлтэй, хөгжилтэй, урам зоригтой сурах орчныг загварчилдаг.",
      photoSeed: "nomin",
      details: "Олон улсын хэрэглэгчийн туршлага судлалын багт ажиллаж байсан. Тэргүүлэгчдийн лидерийн хуудас болон гүйцэтгэлийн анализуудыг урласан шинийг санаачлагч.",
      email: "nomin@innoknow.mn"
    },
    {
      name: "Төмөрбаатар Сарнай (Sarnai)",
      role: "Ахлах Багш, Сургалтын Хөтөлбөр Хариуцагч (Lead Educator)",
      desc: "Заах арга зүйн чиглэлээр 10 гаруй жил ажилласан туршлагатай багш.",
      photoSeed: "sarnai",
      details: "МУБИС-ийг Гадаад хэлний багш мэргэжлээр төгссөн. Оюутнуудын ярианы чадварыг хурдавчилсан аргаар сайжруулах, сэтгэл зүйн бэлтгэл хангахад мэргэшсэн. INNOKNOW-ийн ухаалаг үнэлгээний дасгалууд бэлтгэдэг.",
      email: "sarnai@innoknow.mn"
    },
    {
      name: "Очирбат Ананд (Anand)",
      role: "Маркетинг, Харилцааны Захирал (CMO & Operations)",
      desc: "Стартап хөгжүүлэлт болон брэндинг хариуцсан 5 жилийн туршлагатай бүтээлч захирал.",
      photoSeed: "anand",
      details: "МУИС-ийн Бизнесийн сургуулийг төгссөн. Олон нийтэд технологи хэрэгцээт сургалтыг ухаалаг, хөгжилтэй хэлбэрээр таниулах сурталчилгааны стратеги удирдан ажилладаг.",
      email: "anand@innoknow.mn"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName.trim() && contactEmail.trim() && contactMsg.trim()) {
      setSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-24">
        
        {/* Header Our Mission - Center Aligned */}
        <header className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[#58007E] text-[10px] font-black uppercase tracking-widest">
            <Target size={12} /> БИДНИЙ ЗОРИЛГО
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-serif italic text-slate-900 tracking-tight leading-tight">
            Хэлний бэрхшээлийг <br className="hidden sm:inline" />
            <span className="text-[#58007E]">Гүүр болгон хувиргана.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-500 leading-relaxed font-semibold">
            Бид англи хэлний танхимын хуучинсаг сургалтын загварыг бүрэн халж, хиймэл оюуны хүчин чадлыг ашиглан хэрэглэгч бүрт тохирсон сонирхолтой, хамгийн богино хугацаанд бодит ахиц өгөх шинэлэг системийг хөгжүүлж байна.
          </p>
        </header>

        {/* Section 1: Our Story - Center Aligned */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-black font-serif italic text-slate-900 tracking-tight">Бидний Түүх</h2>
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-[40px] border border-zinc-100 shadow-sm text-sm text-zinc-600 font-medium leading-relaxed space-y-4">
            <p>
              INNOKNOW-ийн суурь нь анх 2024 онд хэлний болон технологийн мэргэжилтнүүд хамтран ухаалаг орчныг бүрдүүлэхээр нэгдсэнээр тавигдсан юм. Бид Монгол сурагчид англиар чөлөөтэй ярихад тулгардаг уламжлалт бэрхшээл болох сургалтын материалын хомсдол, бодит ярианы дадлага хийх боломжгүй орчин зэргийг олж харсан.
            </p>
            <p>
              Gemini AI болон хэл шинжлэлийн дэвшилтэт онол дээр суурилсан хамгийн анхны ярианы дадлагажуулагчийг бүтээж, түүнийгээ өнөөдрийн 50 прогрессив сорилт бүхий цогц систем болгон өргөжүүлсэн. Энэхүү замнал нь манай сурагчдын амжилт бүрээр баяжигдаж байна.
            </p>
          </div>
        </section>

        {/* Section 2: Our Team - Dynamic click states */}
        <section className="text-center space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">БҮТЭЭГЧИД</span>
            <h2 className="text-3xl font-black font-serif italic text-slate-900 tracking-tight">Бидний Баг Хамт Олон</h2>
            <p className="text-xs text-zinc-500 font-bold max-w-md mx-auto mt-2">
              Юу сурч байгаадаа эзэн болоход чинь туслах манай удирдагчидтай танилц. Кард дээр дарж дэлгэрэнгүй намтар уншина уу.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {team.map((partner) => {
              const isSelected = selectedPartner?.name === partner.name;

              return (
                <button
                  key={partner.name}
                  onClick={() => setSelectedPartner(isSelected ? null : partner)}
                  className={`p-6 rounded-[32px] border text-center bg-white transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'border-[#58007E] ring-4 ring-purple-100 scale-[1.02] shadow-xl' 
                      : 'border-zinc-100 hover:border-zinc-200 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-zinc-100 overflow-hidden relative mx-auto flex items-center justify-center text-[#58007E]">
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${partner.photoSeed}`} 
                        alt={partner.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="text-center">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight text-center">{partner.name}</h4>
                      <span className="text-[9px] font-extrabold text-[#58007E]/85 uppercase block mt-1 tracking-wide text-center">
                        {partner.role}
                      </span>
                    </div>

                    <p className="text-slate-400 font-semibold text-[11px] leading-relaxed text-center italic border-t border-slate-50 pt-3">
                      "{partner.desc}"
                    </p>

                    <div className="text-center pt-2">
                      <span className="text-[9px] font-black text-[#58007E] uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">
                        {isSelected ? 'Хураах ▲' : 'Намтар унших ▼'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedPartner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 bg-[#58007E]/5 border border-[#58007E]/10 rounded-[32px] shadow-lg space-y-4 text-center max-w-xl mx-auto"
              >
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-full text-[9px] font-black uppercase">
                  Туршлага & Боловсрол
                </span>
                <h4 className="text-sm font-black text-slate-800 uppercase">{selectedPartner.name}</h4>
                <p className="text-xs text-slate-600 font-bold leading-relaxed whitespace-pre-line text-center">
                  {selectedPartner.details}
                </p>
                <div className="text-slate-400 font-black text-[10px] border-t border-[#58007E]/10 pt-4 font-mono">
                  Холбоо барих: {selectedPartner.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 3: Our Numbers - Center Aligned Grid */}
        <section className="text-center space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">ҮЗҮҮЛЭЛТ</span>
            <h2 className="text-3xl font-black font-serif italic text-slate-900 tracking-tight">Бид Тоогоор</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
              <p className="text-4xl font-extrabold text-[#58007E] font-serif">10K+</p>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-2">Active Students</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
              <p className="text-4xl font-extrabold text-emerald-500 font-serif">50+</p>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-2">Lessons & Tests</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
              <p className="text-4xl font-extrabold text-amber-500 font-serif">98%</p>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-2">Satisfaction Rate</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm text-center">
              <p className="text-4xl font-extrabold text-blue-500 font-serif">2.5M+</p>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-2">Speech Queries</p>
            </div>
          </div>
        </section>

        {/* Section 4: Our Values */}
        <section className="text-center space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">ЗАРЧИМЫН СУУРЬ</span>
            <h2 className="text-3xl font-black font-serif italic text-slate-900 tracking-tight">Үнэт Зүйлс</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {[
              { icon: Heart, t: "Сурагчийн Сэтгэл Ханамж", d: "Сурагч хурдан сурах, ахиц гарахад таатай байх хамгийн хэрэглэгч-төвт дизайны үзэлтэй." },
              { icon: Shield, t: "Чухал Стандартад Тулгуурлах", d: "Дасгалууд нь олон улсын CEFR ба IELTS батлагдсан үнэлгээний зааврын дагуу ангилагдсан." },
              { icon: Zap, t: "Байнгын Шинэчлэл", d: "Системийн шийдлүүдийг долоо хоног бүр шинэчилж, хиймэл оюуны нарийвчлалыг нэмэгдүүлдэг." }
            ].map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-3 flex flex-col items-center justify-center">
                <div className="w-10 h-10 bg-purple-50 text-[#58007E] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <v.icon size={20} />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-800 text-center">{v.t}</h4>
                <p className="text-slate-400 font-bold text-[11px] leading-relaxed text-center">{v.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Contact Form - Center Aligned */}
        <section className="text-center space-y-8 max-w-md mx-auto pt-6">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">ХОЛБОО БАРИХ</span>
            <h2 className="text-3xl font-black font-serif italic text-slate-900 tracking-tight">Бидэнд Бичээрэй</h2>
            <p className="text-xs text-zinc-400 mt-2 font-semibold leading-relaxed">
              Сургалт, хамтын ажиллагаа зэрэгт асуух зүйлсээ илгээж болно.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm text-center">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-gray-800">Амжилттай илгээгдлээ!</p>
                <p className="text-xs text-gray-400">Бид таны имэйл рүү 24 цагийн дотор хариулах болно.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Таны Нэр</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Нэр"
                    className="w-full px-3 py-2 border border-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#58007E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Имэйл Хаяг</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-3 py-2 border border-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#58007E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Зурвас</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Зурвасын агуулга..."
                    className="w-full px-3 py-2 border border-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#58007E] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#58007E] hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Илгээх
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

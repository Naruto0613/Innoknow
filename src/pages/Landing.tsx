import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  BarChart3,
  Heart,
  Shield,
  Zap,
  Users,
  Award,
  Check,
  Star,
  ChevronRight,
  Play,
  Volume2,
  BookOpen,
  Brain,
  Compass,
  TrendingUp,
  HelpCircle,
  Video,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";

// Curriculum structure for interactive Level Guide
const CEFR_LEVELS = [
  {
    tag: "A1",
    name: "Beginner",
    desc: "Энгийн өдөр тутмын хэрэглээний үгс",
    topics: [
      "Мэндчилгээ & Танилцуулга",
      "Өдөр тутмын хүнс, эд зүйлс",
      "Цар хэмжээ, тоо заах",
      "Хялбар асуултанд хариулах",
    ],
    vocab: ["Welcome", "Beautiful", "Teacher", "Introduce"],
    task: "Ярианы тест: 'Өөрийн нэр, нас, амьдардаг хотыг англиар танилцуулна уу.'",
    hours: "40 цаг",
  },
  {
    tag: "A2",
    name: "Elementary",
    desc: "Өгүүлбэр, өнгөрсөн цаг",
    topics: [
      "Өчигдөр болсон үйл явдал",
      "Аялал болон худалдан авалт",
      "Хүсэл сонирхлоо илэрхийлэх",
      "Дуртай зүйлсээ харьцуулах",
    ],
    vocab: ["Prepare", "Holiday", "Purchase", "Miserable"],
    task: "Ярианы тест: 'Өөрийн хамгийн дурсамжтай амралтын өдрөө тайлбарлана уу.'",
    hours: "60 цаг",
  },
  {
    tag: "B1",
    name: "Intermediate",
    desc: "Идэвхтэй харилцан яриа",
    topics: [
      "Ирээдүйн төлөвлөгөө, зорилго",
      "Мэргэжил ба ажил эрхлэлт",
      "Өөрийн үзэл бодлоо хамгаалах",
      "Зөвлөгөө зааварчилгаа тайлбарлах",
    ],
    vocab: ["Accomplish", "Sufficient", "Generous", "Disappointed"],
    task: "Борлуулалтын дадлага: 'Өөрийн дуртай гар утсаа гадаад хэрэглэгчид зарах гэж үз.'",
    hours: "80 цаг",
  },
  {
    tag: "B2",
    name: "Upper-Intermediate",
    desc: "Мэргэжлийн болон эссе",
    topics: [
      "Байгаль орчин, дэлхийн дулаарал",
      "Албан бичиг, мэйл бичих",
      "Хэлц үг ба хэллэгүүд",
      "Шалтгаан үр дагаврыг задлах",
    ],
    vocab: ["Equivalent", "Hypothesis", "Vibrant", "Reluctance"],
    task: "IELTS Speaking Part 2: 'Describe a traditional festival or custom in your country.'",
    hours: "120 цаг",
  },
  {
    tag: "C1",
    name: "Advanced",
    desc: "Эрдэм шинжилгээний анализ",
    topics: [
      "Нийгмийн ээдрээтэй сэдвүүд",
      "Академик судалгааны анализ",
      "Утга санааны аясыг ялгах",
      "Мэтгэлцээний дүрмийн асуултууд",
    ],
    vocab: ["Ubiquitous", "Meticulous", "Pragmatic", "Benevolent"],
    task: "IELTS Writing Task 2: 'Some believe that digital devices narrow the gap between rich and poor classes.'",
    hours: "180 цаг",
  },
  {
    tag: "C2",
    name: "Proficient",
    desc: "Чөлөөтэй сэтгэн бодох",
    topics: [
      "Гүн ухаан болон абстракт сэтгэлгээ",
      "Ярианы нарийн өнгө аяс",
      "Уран зохиолын орчуулга",
      "Албан бус хошин хэллэг",
    ],
    vocab: ["Discrepancy", "Quintessential", "Anachronism", "Preponderance"],
    task: "Гүн ухааны дебат: 'Does digital identity possess moral empathy? Elaborate freehand for 4 minutes.'",
    hours: "240 цаг",
  },
];

export default function Landing() {
  const [activeLevel, setActiveLevel] = useState<string>("A1");

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeLevelData =
    CEFR_LEVELS.find((l) => l.tag === activeLevel) || CEFR_LEVELS[0];

  const faqs = [
    {
      q: "INNOKNOW гэж яг юу вэ? Яагаар өөр гэж?",
      a: "INNOKNOW бол уламжлалт үхмэл дасгалыг халж, монгол хүний англи хэлний сурах зан төлөвт 100% тохируулж бүтээсэн ухаалаг систем юм. Та унших, сонсох, бичих дасгал хийхээс гадна манай хиймэл оюунтай ярианы багштай хуурамч бус бодит яриа өрнүүлж, IELTS ботуудаар өөрийн ооноог бодитоор үнэлүүлэх зэрэг маш олон талт интерактив боломжийг нэг доороос авах болно.",
    },
    {
      q: "AI Ярианы багш (Speaking Coach) намайг засаж өгч чадах уу?",
      a: "Манай AI Ярианы систем таны утсаар ярьсан дуу хоолойг хэл шинжлэлийн өндөр нарийвчлалтай уншиж, дүрмийн алдаа, өгүүлбэрийн бүтэц, дуудлагыг хянан, Монгол хэлээр тайлбарласан үнэлгээг 3-хан секундэд өгдөг. Энэ нь танд гадаад хүнтэй ярихаас айх айдсыг бүрэн давж, гэрээсээ чөлөөтэй суралцах боломж олгоно.",
    },
    {
      q: "Миний суралцсан XP оноо болон явц яаж хадгалагдах вэ?",
      a: "Та манайд бүртгүүлж ормогц Cloud Firestore өгөгдлийн санд таны бүх явц хадгалагдана. Сорилтод амжилттай оролцох бүрт олгогдох XP оноо тань бодит цагийн Лидерийн Шат (Leaderboard) дээр шинэчлэгдэн харагдах тул бусад шилдэг суралцагчидтай өрсөлдөн хамтдаа урагшлах болно!",
    },
    {
      q: "Англи хэлний түвшнээ хэрхэн шалгах вэ?",
      a: "Манайх хэрэглэгчиддээ зориулан хурдан хугацаанд нарийн тодорхойлох түвшин тогтоох сорил (Placement Test)-ыг зүүн төв хэсэгт байршуулсан. Шалгалт өгсний дараа таньд тохирох A1-C2 багцууд идэвхжиж, зорилтот сургалтын замаар алхана.",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[#F8F9FD] min-h-screen text-slate-800 font-sans pb-24">
      {/* Top Left Gradient Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-gradient-to-br from-purple-400/20 via-sky-300/10 to-transparent rounded-full blur-[120px] pointer-events-none"></div>

      {/* Deep Purple Core Glow */}
      <div className="absolute top-[35%] right-[-15%] w-[45vw] h-[45vh] bg-radial from-[#58007E]/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col items-center text-center z-10">
        {/* Dynamic Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#58007E]/8 border border-[#58007E]/20 text-[#58007E] px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={12} className="text-amber-500 animate-spin" />
          <span>ХИЙМЭЛ ОЮУНД СУУРИЛСАН АНГЛИ ХЭЛНИЙ ИРЭЭДҮЙ</span>
        </motion.div>

        {/* Hero Copywriting */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-serif tracking-tight text-slate-950 font-medium leading-[1.05] max-w-4xl"
        >
          Англи хэлийг ухаалгаар <br />
          <span className="relative inline-block font-extrabold italic bg-clip-text text-transparent bg-gradient-to-r from-[#58007E] via-purple-700 to-pink-600">
            INNOKNOW
            <span className="absolute left-0 bottom-1 w-full h-[5px] bg-[#58007E]/10 rounded-full"></span>
          </span>
          -оор эзэмшинэ.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-lg text-slate-600 max-w-2xl mt-6 leading-relaxed font-medium"
        >
          Түвшин бүрт зориулсан 50 өвөрмөц сорилт, унших, сонсох, ярих болон
          бичих дасгалууд. Тэргүүлэгчдийн жагсаалтанд өрсөлдөн хэлний чадвараа
          хурдтай ахиул.
        </motion.p>

        {/* Call To Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center items-center"
        >
          <Link
            to="/signup"
            className="group w-full sm:w-auto bg-[#58007E] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:bg-slate-950 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            Үнэгүй суралцаж эхлэх
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1.5 transition-transform"
            />
          </Link>

          <Link
            to="/pricing"
            className="w-full sm:w-auto px-8 py-5 rounded-2xl border border-slate-350 bg-white/70 hover:bg-slate-50 font-black text-xs uppercase tracking-widest text-[#58007E] hover:border-[#58007E] transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center cursor-pointer"
          >
            Сургалтын эрх авах
          </Link>
        </motion.div>
      </section>

      {/* 2. Sleek Features Grid with Hover Glows */}
      <section className="py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[#58007E] font-black text-[10px] uppercase tracking-widest">
            Хиймэл оюуны бодит шийдлүүд
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic font-medium tracking-tight text-slate-950">
            Бидний Онцлох Багцууд
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-semibold leading-relaxed">
            Таны хэл сурах бүх хэрэгцээг нэг дор цогцлоосон ухаалаг экосистемтэй
            танилцана уу.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "🎙️ AI Ярианы Багш (Speaking Coach)",
              desc: "Ганцаараа ярихаас бүү ай. Таны дуу хоолой, дуудлага, өгүүлбэрийн дүрмийг сонсоод Монгол хэл дээр засварлан нарийн тайлбарлана.",
              badge: "Сар бүр шинэчлэгдэнэ",
              bg: "bg-white",
              accent: "border-purple-200",
            },
            {
              icon: BarChart3,
              title: "🏆 Бодит Цагийн Шат (Live Leaderboard)",
              desc: "Бусад суралцагчидтай XP оноогоор маргаашгүй өрсөлдөнө. Сар бүр шинэ лигийн ялагч болж, суралцах идэвхээ 10 дахин нэмэгдүүлнэ.",
              badge: "Бодит цагийн өрсөлдөөн",
              bg: "bg-white",
              accent: "border-emerald-200",
            },
            {
              icon: Sparkles,
              title: "📝 IELTS Сорьсон Сорилтууд",
              desc: "Шалгалтын бэрх академик унших, сонсох, бичих, ярих хэсгийн дуураймал сорилуудыг Gemini AI-ийн албан ёсны шалгуураар дүгнүүлнэ.",
              badge: "Академик бэлтгэл",
              bg: "bg-white",
              accent: "border-amber-200",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`p-8 rounded-[30px] border border-slate-200 hover:border-[#58007E] hover:shadow-2xl hover:shadow-[#58007E]/5 hover:-translate-y-1 transition-all ${feature.bg} flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-purple-50 text-[#58007E] rounded-2xl flex items-center justify-center">
                    <feature.icon size={22} />
                  </div>
                  <span className="text-[8px] font-black uppercase text-slate-400 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-md">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight pt-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-xs font-semibold">
                  {feature.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[#58007E] font-black text-[10px] uppercase tracking-wider">
                <span>Илүү ихийг судлах</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Level Guide (CEFR Explorer) */}
      <section className="bg-slate-50 py-24 border-y border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[#58007E] font-black text-[10px] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Сургалтын хөтөлбөр
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-slate-950 font-medium">
              Түвшний Хөтөлбөртэй Танилцах
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-semibold">
              Өөрийн англи хэлний түвшинг сонгон, судалж үгсийн сан, хичээлийн
              төлөвлөгөө болон шаргалтын сэдвийг урьдчилан сонирхоорой.
            </p>
          </div>

          {/* Selector bar */}
          <div className="flex flex-wrap bg-slate-200/50 p-2 rounded-[24px] max-w-3xl mx-auto justify-between gap-1 border border-slate-300/30">
            {CEFR_LEVELS.map((lvl) => (
              <button
                key={lvl.tag}
                onClick={() => setActiveLevel(lvl.tag)}
                className={`flex-1 min-w-[70px] py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeLevel === lvl.tag
                    ? "bg-[#58007E] text-white shadow-xl"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                }`}
              >
                {lvl.tag}
              </button>
            ))}
          </div>

          {/* Active Level Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mt-10 bg-white p-8 md:p-10 rounded-[32px] border border-slate-200 shadow-xl max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Summary */}
              <div className="md:col-span-5 bg-gradient-to-br from-[#58007E]/5 to-purple-500/10 p-6 md:p-8 rounded-2xl border border-[#58007E]/10 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-[#58007E] text-white flex items-center justify-center text-lg font-black">
                      {activeLevelData.tag}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {activeLevelData.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                        {activeLevelData.desc}
                      </p>
                    </div>
                  </div>

                  <hr className="my-6 border-slate-200" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Суралцах хугацаа:
                      </span>
                      <span className="text-xs font-black text-[#58007E]">
                        {activeLevelData.hours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-semibold">
                        Идэвхтэй үгсийн сан:
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        100+ үг хэллэг
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/signup"
                  className="w-full py-4 text-center bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-md"
                >
                  Сургалтыг үүнээс эхлэх
                </Link>
              </div>

              {/* Right Column: Key Details */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#58007E] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Compass size={14} /> Сургалтын гол дүрмүүд ба сэдвүүд:
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {activeLevelData.topics.map((t, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs font-semibold text-slate-700"
                      >
                        <Check
                          size={14}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Brain size={14} /> Голчлон судалж эзэмших академик үгс:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeLevelData.vocab.map((v) => (
                      <span
                        key={v}
                        className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                  <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">
                    Ярианы жишиг IELTS сорил даалгавар:
                  </p>
                  <em className="text-slate-800 font-serif font-medium leading-relaxed">
                    "{activeLevelData.task}"
                  </em>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Elegant Testimonial Slider / Grid */}
      <section className="py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-2">
          <span className="text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-3 py-1 bg-amber-100/30 rounded-full border border-amber-200/50">
            Амжилтын хуудас
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-slate-905 font-medium text-slate-950">
            Монгол Сурагчдын Сэтгэгдэл
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-semibold">
            INNOKNOW системийг ашиглан маш хурдан хугацаанд ярианы айдсаа давж,
            IELTS шалгалтаа гүйцэтгэсэн шилдэг суралцагчдаас сурсан дурсамжууд.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "О. Баярмаа",
              role: "Хоршоологч, IELTS 7.5",
              content:
                "Үргэлж дүрмийн алдаанаас болоод чөлөөтэй дуугарч зүрхэлдэггүй байсан. Манай AI ярианы багшаар тасралтгүй засуулснаар 3 долоо хоногийн дотор яриа маань огт өөр болсон. IELTS оноо маань 5.5-аас 7.5 хүртэл шууд өссөн!",
              rating: 5,
              avatar: "Б",
            },
            {
              name: "Т. Анхбаяр",
              role: "Программ Хөгжүүлэгч",
              content:
                "Системийн XP цуглуулах, лигт бусадтай өрсөлдөх сорил хэсэг нь маш донтуулдаг юм билээ. Идэвхтэй өрсөлдсөөр байтал өгөгдсөн 50 сорилыг хэзээ дуулгаснаа ч анзаараагүй. Үр дүнтэй бас тун зугаатай платформ байна.",
              rating: 5,
              avatar: "А",
            },
            {
              name: "Н. Саруул",
              role: "Оюутан, Улаанбаатар хот",
              content:
                "Монгол сурагчдад зориулсан үгийн орчуулга болон дүрмийн ухаалаг тайлбарууд нь маш хэрэгтэй. Бусад гадаад үнэтэй систем шиг хуурай бус, нөхцөл байдалд бүрэн таарсан зөвлөгөөнүүд өгдөгт нь талархаж байна. Сэтгэл ханамж 100%.",
              rating: 5,
              avatar: "С",
            },
          ].map((testi, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[30px] border border-slate-200/80 shadow-md relative group hover:shadow-xl transition-all hover:border-[#58007E]/30 text-left flex flex-col justify-between"
            >
              <div>
                {/* Visual Stars */}
                <div className="flex gap-1 text-amber-400 mb-5">
                  {Array.from({ length: testi.rating }).map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs italic leading-relaxed font-semibold">
                  "{testi.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#58007E] to-pink-500 text-white flex items-center justify-center font-black text-xs">
                  {testi.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-tight">
                    {testi.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                    {testi.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
              Асуулт Хариулт
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-slate-950 font-medium">
              Түгээмэл Асуудаг Асуултууд
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-xs font-semibold">
              INNOKNOW платформтай холбоотой илүү нарийн мэдээллүүдийг доороос
              сонирхоно уу.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-slate-900 group cursor-pointer"
                  >
                    <span className="group-hover:text-[#58007E] transition-colors">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-slate-400 group-hover:text-[#58007E]"
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-semibold">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Styled Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6 text-left">
            <h3 className="text-xl font-extrabold tracking-wider text-white">
              INNOKNOW
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Монгол суралцагчдад зориулан бүтээгдсэн хиймэл оюуны тусламжтай
              англи хэл заах ухаалаг экосистем сургалтын платформ. Шинэлэг сорил
              ба бодит үр дүн.
            </p>
            <div className="flex gap-4">
              <span
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-[#58007E] hover:bg-slate-700 transition"
                title="English Leveling Studio"
              >
                IE
              </span>
              <span
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-rose-500 hover:bg-slate-700 transition"
                title="Active IELTS Core"
              >
                AI
              </span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-[10px] font-black text-slate-450 tracking-widest uppercase">
              Үндсэн холбоосууд
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white transition">
                  Хичээл Дасгалууд
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition">
                  Бүтээгдэхүүний Үнэ
                </Link>
              </li>
              <li>
                <Link to="/vocabulary" className="hover:text-white transition">
                  Үгсийн Сангийн сорил
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Бидний Тухай
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-[10px] font-black text-slate-450 tracking-widest uppercase">
              Холбоо барих мэдээлэл
            </h4>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Sukhbaatar District, Ulaanbaatar, Mongolia.
              <br />
              И-мэйл: support@innoknow.mn
            </p>
            <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-semibold">
              🔒 Систем нь Cloud Firebase болон Google Gemini API хамгаалалтаар
              найдвартай ажиллаж байна.
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <p>
            © {new Date().getFullYear()} INNOKNOW Inc. Бүх эрх хамгаалагдсан.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Үйлчилгээний нөхцөл
            </a>
            <a href="#" className="hover:text-white">
              Нууцлалын бодлого
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

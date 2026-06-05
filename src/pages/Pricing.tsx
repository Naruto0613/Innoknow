import React, { useState } from 'react';
import { useAuth, UserProfile } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Copy, CreditCard, Shield, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface CopyState {
  bank: boolean;
  ref: boolean;
  amount: boolean;
}

export default function Pricing() {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [copied, setCopied] = useState<CopyState>({ bank: false, ref: false, amount: false });

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <p className="text-slate-500 font-bold">Уучлаарай, та эхлээд нэвтэрнэ үү.</p>
      </div>
    );
  }

  const refToUse = profile.paymentRef || (profile.uid ? 'user_' + profile.uid.substring(0, 6) : 'user_ref');

  const plans = [
    {
      id: 'pro' as const,
      name: 'Pro',
      priceNum: 9999,
      priceLabel: '9,999₮/сарын',
      description: 'Ахисан түвшний цогц дасгал, хязгааргүй сургалт',
      features: [
        'Unlimited lessons (Хязгааргүй хичээл)',
        'Full leaderboard (National level - Улсын хэмжээний чарт)',
        'Unlimited battle (Хязгааргүй батл дуэл)',
        'AI pronunciation check (AI дуудлага засагч)',
        '100+ premium exercises (100+ премиум дасгал)',
        '30+ day streak rewards (Streak урамшуулал)',
        'Digital certificate (Дижитал сертификат)',
      ],
      color: 'border-slate-200 bg-white text-slate-800',
      btnText: 'Сонгох',
      ctaClass: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      priceNum: 19999,
      priceLabel: '19,999₮/сарын',
      description: 'IELTS бэлтгэл, VIP зөвлөгөө, AI багшийн симуляци',
      features: [
        'Everything in Pro (Pro-ийн бүх эрх)',
        'IELTS mock test system (IELTS-ийн жишиг шалгалт)',
        'Detailed performance analytics (Нарийвчилсан статистик)',
        'Weekly live workshop (Долоо хоног бүр лайв воркшоп)',
        '1:1 AI speaking simulation (1:1 AI ярианы дадлага)',
        'Verified certificate with QR code (QR баталгаажуулалттай сертификат)',
      ],
      color: 'border-[#D9A74A] bg-[#141414] text-white ring-4 ring-[#D9A74A]/20',
      btnText: 'Сонгох',
      ctaClass: 'bg-[#D9A74A] hover:bg-[#C1923A] text-[#141414] font-extrabold',
      badge: '🔥 Most Popular'
    }
  ];

  const handleSelectPlan = async (planType: 'pro' | 'premium') => {
    setSelectedPlan(planType);
    setPaymentSubmitted(profile.paymentStatus === 'Pending' && profile.plan === planType);
  };

  const copyToClipboard = (text: string, field: keyof CopyState) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setSubmittingPayment(true);

    const price = selectedPlan === 'pro' ? 9999 : 19999;
    const paymentReq = {
      userId: profile.uid,
      userName: profile.displayName || 'Сурагч',
      userEmail: profile.email,
      paymentRef: refToUse,
      plan: selectedPlan,
      amount: price,
      status: 'pending' as const,
      requestedAt: new Date().toISOString(),
      confirmedBy: []
    };

    try {
      // Save to Firebase firestore paymentRequest
      await setDoc(doc(db, 'paymentRequests', profile.uid), paymentReq);
      
      // Update local profile status
      await updateProfile({
        paymentStatus: 'Pending',
        plan: selectedPlan // Save the plan they are requesting
      });

      setPaymentSubmitted(true);
    } catch (error) {
      console.error("Firestore payment request submit error:", error);
      // Fallback update to local storage to keep user experience responsive
      const allReqs = JSON.parse(localStorage.getItem('innoknow_payment_requests') || '{}');
      allReqs[profile.uid] = paymentReq;
      localStorage.setItem('innoknow_payment_requests', JSON.stringify(allReqs));

      await updateProfile({
        paymentStatus: 'Pending',
        plan: selectedPlan
      });
      setPaymentSubmitted(true);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Check if trial has expired or access is locked
  const isTrialFinished = profile.plan === 'expired' || 
                          (profile.plan === 'trial' && 
                           profile.trialExpiry && 
                           new Date(profile.trialExpiry).getTime() <= Date.now());

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFCFB] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-4"
          >
            <Sparkles size={12} /> INNOKNOW SUBSCRIPTION
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif italic text-slate-900 tracking-tight">
            Төлөвлөгөө Сонгох
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto font-medium text-sm">
            Англи хэлийг илүү хурдан бөгөөд үр дүнтэй сурахын тулд өөрт тохирсон премиум төлөвлөгөөг идэвхжүүлээрэй.
          </p>
        </div>

        {isTrialFinished && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-amber-50/80 border-2 border-amber-500/20 rounded-[32px] max-w-2xl mx-auto flex items-start gap-4 text-left shadow-sm justify-center"
          >
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0">
              <AlertCircle size={24} className="stroke-[2.5] animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950 uppercase tracking-tight">Таны үнэгүй trial дууслаа</h3>
              <p className="text-xs text-amber-800 font-bold mt-1 leading-relaxed">
                Таны 3 хоногийн үнэгүй туршилтын хугацаа амжилттай дууссан тул сургалтын систем хаагдсан байна. Үргэлжлүүлэн хязгааргүй суралцахын тулд Pro эсвэл Premium багцаас сонгон идэвхжүүлнэ үү.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!selectedPlan ? (
            <motion.div
              key="pricing-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto"
            >
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`relative p-8 rounded-[36px] border flex flex-col justify-between transition-all hover:shadow-2xl hover:translate-y-[-4px] ${p.color}`}
                >
                  {p.badge && (
                    <span className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest text-[#D9A74A] bg-yellow-400/10 px-3 py-1 rounded-full border border-[#D9A74A]/20">
                      {p.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-2">{p.name}</h3>
                    <p className={`text-xs mb-6 ${p.id === 'premium' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                      {p.description}
                    </p>
                    <div className="mb-8">
                      <span className="text-3xl font-black">{p.priceLabel}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {p.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-semibold leading-relaxed">
                          <Check className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${p.ctaClass}`}
                  >
                    {p.btnText}
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="payment-gateway"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-100"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest hover:underline cursor-pointer mb-2 block"
                  >
                    ← Төлөвлөгөө Сонголт руу Буцах
                  </button>
                  <h2 className="text-2xl font-black font-serif italic text-slate-900">Премиум Идэвхжүүлэх</h2>
                </div>
                <div className="p-3 bg-indigo-50 text-[#58007E] rounded-2xl">
                  <CreditCard size={24} />
                </div>
              </div>

              {/* Status Section */}
              {paymentSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={56} className="text-amber-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Төлбөр баталгаажихыг хүлээж байна...</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-6">
                    Таны төлбөрийн хүсэлтийг хүлээн авлаа. Манай админууд хоёулаа гүйлгээний утгыг (<span className="text-[#58007E] font-black">{refToUse}</span>) шалгаж баталгаажуулсны дараа таны сургалтын эрх идэвхжих болно.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 px-6 py-4 rounded-2xl max-w-md mx-auto text-left text-[11px] font-semibold text-amber-800 leading-relaxed">
                    ℹ️ <span className="font-bold">Санамж:</span> Давхар админ баталгаажуулалт шаардлагатай тул 24 цаг хүртэлх хугацаа шаардагдаж болно. Идэвхжсэн даруйд имэйлээр мэдэгдэх болно.
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-8 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Хянах самбар луу очих
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Сонгосон багц</p>
                      <h4 className="text-lg font-bold text-[#58007E]">{selectedPlan === 'pro' ? 'Pro Plan License' : 'Premium VIP Plan'}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Дүн</p>
                      <h4 className="text-lg font-black text-slate-900">{selectedPlan === 'pro' ? '19,999₮' : '39,999₮'}</h4>
                    </div>
                  </div>

                  {/* BANK DETAILS INTERACTIVE BLOCKS */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-dashed border-slate-200 pb-2">Банкны Дансны Мэдээлэл</p>
                    
                    {/* Bank Number Field */}
                    <div className="relative group bg-slate-50 hover:bg-[#FDFCFB] p-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Банкны дугаар</span>
                        <span className="text-sm font-black text-slate-800 leading-none">MN330005005035791563</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('MN330005005035791563', 'bank')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 ${
                          copied.bank ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 hover:bg-indigo-100 text-[#58007E]'
                        }`}
                      >
                        {copied.bank ? '✅ Хуулагдлаа!' : <><Copy size={12} /> Хуулах</>}
                      </button>
                    </div>

                    {/* Instruction Reference Field */}
                    <div className="relative group bg-slate-50 hover:bg-[#FDFCFB] p-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Гүйлгээний утга (Таны ID)</span>
                        <span className="text-sm font-black text-[#58007E] leading-none">{refToUse}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(refToUse, 'ref')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 ${
                          copied.ref ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 hover:bg-indigo-100 text-[#58007E]'
                        }`}
                      >
                        {copied.ref ? '✅ Хуулагдлаа!' : <><Copy size={12} /> Хуулах</>}
                      </button>
                    </div>

                    {/* Amount Field */}
                    <div className="relative group bg-slate-50 hover:bg-[#FDFCFB] p-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Төлбөрийн дүн</span>
                        <span className="text-sm font-black text-slate-800 leading-none">{selectedPlan === 'pro' ? '9999₮' : '19999₮'}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedPlan === 'pro' ? '19999' : '39999', 'amount')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 ${
                          copied.amount ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 hover:bg-indigo-100 text-[#58007E]'
                        }`}
                      >
                        {copied.amount ? '✅ Хуулагдлаа!' : <><Copy size={12} /> Хуулах</>}
                      </button>
                    </div>
                  </div>

                  {/* MANDATORY INSTRUCTIONS */}
                  <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                    <h5 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">⚠️ ЧУХАЛ ЗААВАРЧИЛГАА:</h5>
                    <ul className="space-y-2 text-[11px] font-bold text-amber-800 leading-relaxed list-disc list-inside">
                      <li>"Хаанбанк аппаар шилжүүлэг хийнэ үү"</li>
                      <li>"Гүйлгээний утганд заавал <span className="text-[#58007E] font-black decoration-double underline">{refToUse}</span> гэж бичнэ үү"</li>
                      <li>"Буруу гүйлгээний утга бичвэл төлбөр баталгаажихгүй"</li>
                      <li>"Төлбөр баталгаажихад 24 цаг хүртэл хугацаа шаардагдаж болно"</li>
                    </ul>
                  </div>

                  {/* Confirmation Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer text-center"
                    >
                      Цуцлах
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={submittingPayment}
                      className="flex-1 py-4 bg-[#58007E] hover:bg-[#40005C] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-purple-200 disabled:opacity-50"
                    >
                      {submittingPayment ? 'Бүртгэж байна...' : <><CheckCircle2 size={16} /> Би төлбөр төллөө</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

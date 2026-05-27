import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Download,
  Linkedin,
  QrCode,
  Search,
  Share2,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface CertificateData {
  id: string;
  type: "beginner" | "intermediate" | "advanced" | "streak100";
  title: string;
  description: string;
  cefr: string;
  reqs: string;
  cvValue: string;
}

export default function Certificates() {
  const { profile, updateProfile } = useAuth();
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(
    null,
  );
  const [claimingCertId, setClaimingCertId] = useState<string | null>(null);

  if (!profile) return null;

  const certificateTypes: CertificateData[] = [
    {
      id: "beginner",
      type: "beginner",
      title: "Beginner Certificate (A1-A2)",
      description: "Англи хэлний анхан шатны мэдлэгийг батлах гэрчилгээ.",
      cefr: "CEFR A1 / A2 Competency",
      reqs: "A1 болон A2 түвшний бүх хичээлийг амжилттай дүүргэсэн байх (Танд 30+ хичээл дүүргэсэн хувиар олгоно).",
      cvValue:
        "Энэхүү гэрчилгээ нь таныг англи хэлний суурь өгүүлбэрүүдийг ойлгох, өдөр тутмын энгийн харилцааг хөтлөх чадвартай болохыг ажил олгогчдод гэрчилнэ.",
    },
    {
      id: "intermediate",
      type: "intermediate",
      title: "Intermediate Certificate (B1-B2)",
      description: "Англи хэлний дунд шатны мэдлэгийг батлах гэрчилгээ.",
      cefr: "CEFR B1 / B2 Competency",
      reqs: "B1 болон B2 түвшний бүх хичээлүүдийг дуусгасан байх.",
      cvValue:
        "Дунд шатны сертификат нь таныг мэргэжлийн сэдвүүдийг ойлгох, чөлөөтэй илэрхийлэх, өөртөө итгэлтэйгээр гадны түншүүдтэй имэйл бичих чадварыг батална.",
    },
    {
      id: "advanced",
      type: "advanced",
      title: "Advanced Certificate (C1-C2)",
      description:
        "Англи хэлний ахисан дунд болон дээд шатны мэдлэгийн гэрчилгээ.",
      cefr: "CEFR C1 / C2 Advanced Competency",
      reqs: "C1 болон C2 түвшний бүх дасгал цуврал хичээлүүдийг дуусгасан байх.",
      cvValue:
        "Дээд шатны сертификат нь таныг бичгээр болон аман хэлбэрээр цогц илэрхийлэл өгөх, IELTS-ийн өндөр онооны урьдчилсан мэдлэгийг бүрэн эзэмшсэнийг баталдаг.",
    },
    {
      id: "streak100",
      type: "streak100",
      title: "100-Day Streak Milestone Certificate",
      description:
        "Нийт 100 хоног тасралтгүй суралцсан тууштай сэтгэлгээний баталгаа.",
      cefr: "100-Day Consistency Guard",
      reqs: "Тасралтгүй 100 өдрийн streak-г амжилттай дуусгаж барьж чадсан байх",
      cvValue:
        "Суралцах чин эрмэлзэлтэй, тууштай суралцах сахилга баттай тул хамгийн хариуцлагатай ажилтан, манлайлагч гэдгийг тань баталдаг хүчирхэг баримт бичиг.",
    },
  ];

  const hasClaimed = (typeId: string) => {
    return (profile.certificatesEarned || []).includes(typeId);
  };

  const isEligible = (cert: CertificateData) => {
    // Check eligibility based on the requirements
    if (profile.plan === "premium") return true; // VIP direct unlocks for testing
    if (hasClaimed(cert.id)) return true;

    if (cert.id === "beginner") {
      return (profile.lessonsCompleted || 0) >= 10; // minimum required completed lessons
    }
    if (cert.id === "intermediate") {
      return (
        (profile.lessonsCompleted || 0) >= 20 &&
        (profile.level === "B1" ||
          profile.level === "B2" ||
          profile.level === "C1" ||
          profile.level === "C2")
      );
    }
    if (cert.id === "advanced") {
      return (
        (profile.lessonsCompleted || 0) >= 30 &&
        (profile.level === "C1" || profile.level === "C2")
      );
    }
    if (cert.id === "streak100") {
      return (profile.streak || 0) >= 100;
    }
    return false;
  };

  const handleClaimCertificate = async (cert: CertificateData) => {
    setClaimingCertId(cert.id);
    const certUID =
      "CERT_" + Math.random().toString(36).substring(2, 11).toUpperCase();

    // QR Code source if Premium
    const qrSource =
      profile.plan === "premium"
        ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://innoknow.mn/verify-certificate/${certUID}`
        : "";

    const newCertRecord = {
      certId: certUID,
      userId: profile.uid,
      userName: profile.displayName || "Сурагч",
      type: cert.type,
      issuedAt: new Date().toISOString(),
      qrCode: qrSource,
    };

    try {
      // Save direct to metadata registers
      await setDoc(doc(db, "certificates", certUID), newCertRecord);
    } catch (e) {
      console.warn("Could not save certificate record to Firestore:", e);
    }

    // Update user profiles lists
    const updatedEarned = [...(profile.certificatesEarned || [])];
    if (!updatedEarned.includes(cert.id)) {
      updatedEarned.push(cert.id);
    }

    await updateProfile({
      certificatesEarned: updatedEarned,
    });

    setClaimingCertId(null);
    setSelectedCert(cert);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleLinkedInShare = (cert: CertificateData) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://innoknow.mn/verify-certificate/${profile.uid}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FDFCFB] py-12 px-4 md:px-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Title: Disappears during printing */}
        <div className="text-center mb-12 print:hidden">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[#58007E] text-xs font-black uppercase tracking-widest mb-4"
          >
            <Award size={14} className="text-[#58007E] h-4 w-4 animate-pulse" />{" "}
            INNOKNOW CERTIFICATIONS
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 tracking-tight">
            Дижитал Сертификатууд
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-xs md:text-sm max-w-xl mx-auto">
            Таны англи хэлний сургалтын үр дүн, хичээл зүтгэлийг албан ёсоор
            баталгаажуулах CEFR стандартын дижитал сертификат.
          </p>
        </div>

        {/* Dynamic Display Modal / Grid split */}
        <AnimatePresence mode="wait">
          {selectedCert ? (
            <motion.div
              key="certificate-viewer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Back button for Printing safety */}
              <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-4">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest hover:underline cursor-pointer"
                >
                  ← Сертификатуудын жагсаалт руу буцах
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLinkedInShare(selectedCert)}
                    className="px-4 py-2 bg-[#0077B5] text-white hover:bg-[#005582] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Linkedin size={14} /> Add to LinkedIn
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={14} /> Хэвлэх / татах
                  </button>
                </div>
              </div>

              {/* IMMERSIVE PHYSICAL DIPLOMA */}
              <div
                id="diploma-canvas"
                className="bg-white border-12 border-slate-800 p-8 md:p-16 rounded-sm shadow-2xl tracking-normal text-slate-800 max-w-2xl mx-auto relative overflow-hidden print:border-none print:shadow-none"
              >
                {/* Vintage sideborders pattern */}
                <div className="absolute inset-4 border border-dashed border-slate-300 pointer-events-none"></div>
                <div className="relative text-center space-y-6">
                  {/* INNOKNOW Heading */}
                  <div className="flex justify-center flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-[#58007E] rounded-xl flex items-center justify-center text-white font-black text-2xl italic">
                      I
                    </div>
                    <span className="font-serif italic text-sm tracking-widest font-bold">
                      INNOKNOW ACADEMY
                    </span>
                  </div>

                  <h2 className="text-amber-600 font-serif text-xs uppercase tracking-[0.25em] font-bold">
                    CERTIFICATE OF ACHIEVMENT
                  </h2>

                  <p className="text-slate-400 font-serif italic text-xs">
                    This credential certifies that:
                  </p>

                  {/* Student Full Name */}
                  <h3 className="text-2xl md:text-3xl font-serif italic font-black text-slate-900 border-b border-dashed border-slate-300 pb-3 max-w-sm mx-auto">
                    {profile.displayName || "Монгол Сурагч"}
                  </h3>

                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    has successfully satisfied all standardized academic
                    requirements and maintained pristine learning consistencies
                    to be awarded the title of
                  </p>

                  <h4 className="text-lg md:text-xl font-black text-slate-900 font-serif italic tracking-wide uppercase px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg inline-block">
                    {selectedCert.cefr}
                  </h4>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Issued on {new Date().toLocaleDateString("mn-MN")} | Unique
                    ref_ID:{" "}
                    <span className="font-mono text-[#58007E] font-bold">
                      INNO_CERT_
                      {profile.uid.substring(3).toUpperCase() || "REF_X"}
                    </span>
                  </p>

                  {/* Dual signatures & Sign-offs */}
                  <div className="grid grid-cols-2 gap-8 pt-10 border-t border-dashed border-slate-200 mt-8 max-w-lg mx-auto">
                    {/* Sig 1 */}
                    <div className="text-center">
                      <p className="font-serif italic text-[#58007E] font-bold text-sm leading-none h-6">
                        S.Setsen
                      </p>
                      <div className="border-t border-slate-350 pt-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Гүйцэтгэх захирал, Setsen
                      </div>
                    </div>
                    {/* Sig 2 */}
                    <div className="text-center">
                      <p className="font-serif italic text-[#58007E] font-bold text-sm leading-none h-6">
                        N.Nomin
                      </p>
                      <div className="border-t border-slate-350 pt-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Сургалтын албаны дарга, Nomin
                      </div>
                    </div>
                  </div>

                  {/* PREMIUM QR CODE SECTION */}
                  {profile.plan === "premium" ? (
                    <div className="pt-6 flex justify-center flex-col items-center gap-1.5 print:break-inside-avoid">
                      <div className="p-2 border rounded bg-slate-50 shadow-inner flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://innoknow.mn/verify-certificate/INNO_CERT_${profile.uid.substring(3).toUpperCase()}`}
                          alt="Verification QR"
                          className="w-20 h-20"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] text-[#58007E] font-black uppercase tracking-widest flex items-center gap-1">
                        <QrCode size={10} /> QR БАТАЛГААЖСАН
                      </span>
                    </div>
                  ) : (
                    <div className="pt-4 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                        🔒 QR баталгаажуулалт зөвхөн Premium-д нээлттэй
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CV VALUE & PORTFOLIO WRITER PANEL */}
              <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 max-w-2xl mx-auto print:hidden">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                  CV / Ажил хайх хэсэгт ашиглах байдал (Нэмүү өртөг)
                </h4>
                <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">
                  {selectedCert.cvValue}
                </p>
                <div className="p-4 bg-white rounded-2xl border border-slate-150 text-[10px] text-slate-400 italic">
                  <strong>Загвар CV текстийн оруулга:</strong> "Монголын шилдэг
                  шинэлэг платформ болох INNOKNOW-ээс CEFR-ийн стандартын англи
                  хэлний түвшний гэрчилгээг тууштай суралцаж амжилттай дуусган
                  олж авсан."
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="certificates-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {certificateTypes.map((cert) => {
                const claimed = hasClaimed(cert.id);
                const eligible = isEligible(cert);

                return (
                  <div
                    key={cert.id}
                    className={`bg-white p-8 rounded-[36px] border flex flex-col justify-between transition-all hover:shadow-xl ${
                      claimed ? "border-[#58007E]" : "border-slate-150"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`p-4 rounded-3xl ${claimed ? "bg-purple-100 text-[#58007E]" : "bg-slate-50 text-slate-500"}`}
                        >
                          <Award size={24} />
                        </div>
                        {claimed ? (
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} /> АВСАН
                          </span>
                        ) : eligible ? (
                          <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                            АВАХ боломжтой
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                            ХҮЛЭЭГДЭЖ БҮЙ
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-serif mb-2 text-slate-800">
                        {cert.title}
                      </h3>
                      <p className="text-xs font-bold text-[#58007E] font-mono mb-4">
                        {cert.cefr}
                      </p>

                      <div className="space-y-4 pt-4 border-t border-slate-50 mb-8">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                            Олгох шалгуур:
                          </span>
                          <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                            {cert.reqs}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {claimed ? (
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="flex-1 py-3.5 bg-[#58007E] text-white hover:bg-[#40005C] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-center"
                        >
                          Харах / Татах
                        </button>
                      ) : eligible ? (
                        <button
                          onClick={() => handleClaimCertificate(cert)}
                          disabled={claimingCertId !== null}
                          className="flex-1 py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-center"
                        >
                          {claimingCertId === cert.id
                            ? "Шалгаж байна..."
                            : "Сертификатыг баталгаажуулах"}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-3.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed text-center"
                        >
                          Шалгуур хараахан хангагдаагүй
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { MessageSquare, X, Send, AlertTriangle, CheckCircle, Lightbulb, Heart, HelpCircle } from 'lucide-react';

export default function FeedbackButton() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'bug' | 'suggestion' | 'compliment' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill user details when they log in or change
  useEffect(() => {
    if (profile) {
      setName(profile.displayName || '');
      setEmail(profile.email || '');
    } else if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [user, profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Нэрээ оруулна уу.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Зөв имэйл хаяг оруулна уу.');
      return;
    }
    if (message.trim().length < 20) {
      setErrorMsg('Санал хүсэлт хамгийн багадаа 20 тэмдэгттэй байх ёстой.');
      return;
    }

    setLoading(true);

    try {
      const feedbackData = {
        userId: user?.uid || 'anonymous',
        userName: name,
        userEmail: email,
        type,
        message,
        status: 'new' as const,
        createdAt: new Date().toISOString()
      };

      // 1. Save to Firestore
      await addDoc(collection(db, 'feedback'), feedbackData);

      // 2. Send via EmailJS REST API
      const emailjsData = {
        service_id: 'service_wce8g18',
        template_id: 'template_n0rpq1p',
        user_id: 'o1QW8PPCcdDVFpf9x',
        template_params: {
          name: name,
          email: email,
          type: type === 'bug' ? 'Халдвар/Алдаа (Bug)' : type === 'suggestion' ? 'Санал хүсэлт' : type === 'compliment' ? 'Талархал' : 'Бусад',
          message: message,
          userId: user?.uid || 'anonymous',
          date: new Date().toLocaleDateString('mn-MN')
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailjsData),
      });

      if (!response.ok) {
        console.warn('EmailJS sending warning:', await response.text());
      }

      setSuccess(true);
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);

    } catch (err: any) {
      console.error('Feedback submit error:', err);
      // Fallback local storage logging if Firestore/Network fails
      try {
        const localFeedbacks = JSON.parse(localStorage.getItem('innoknow_feedbacks') || '[]');
        localFeedbacks.push({
          id: 'fb_' + Date.now(),
          userName: name,
          userEmail: email,
          type,
          message,
          status: 'new',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('innoknow_feedbacks', JSON.stringify(localFeedbacks));
        setSuccess(true);
        setMessage('');
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 3000);
      } catch (storageErr) {
        setErrorMsg('Илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        id="btn-floating-feedback"
        onClick={() => {
          setIsOpen(true);
          setSuccess(false);
          setErrorMsg('');
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#58007E] hover:bg-[#430060] text-white px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm font-medium"
      >
        <MessageSquare className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline">Санал хүсэлт</span>
      </button>

      {/* Backdrop & Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#58007E] text-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Санал хүсэлт илгээх</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-6 overflow-y-auto flex-1">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                  <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                  <p className="text-lg font-semibold text-gray-800">Илгээгдлээ!</p>
                  <p className="text-sm text-gray-500">Санал хүсэлтийг амжилттай илгээлээ!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-xs leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Таны Нэр</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Нэрээ оруулна уу"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#58007E]/30 focus:border-[#58007E]"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Имэйл хаяг</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Имэйл хаягаа оруулна уу"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#58007E]/30 focus:border-[#58007E]"
                    />
                  </div>

                  {/* Feedback Type Selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Хүсэлтийн Төрөл</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setType('suggestion')}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          type === 'suggestion'
                            ? 'border-[#58007E] bg-[#58007E]/5 text-[#58007E] font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Санал
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          type === 'bug'
                            ? 'border-red-500 bg-red-50 text-red-600 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Алдаа / Bug
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('compliment')}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          type === 'compliment'
                            ? 'border-green-500 bg-green-50 text-green-600 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Талархал
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('other')}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          type === 'other'
                            ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Бусад
                      </button>
                    </div>
                  </div>

                  {/* Message box */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-600">Дэлгэрэнгүй агуулга</label>
                      <span className="text-[10px] text-gray-400">
                        {message.length} / 20 тэмдэгт
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Санал хүсэлт, алдааны тайланг энд бичнэ үү (дор хаяж 20 тэмдэгт)..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#58007E]/30 focus:border-[#58007E] resize-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Болих
                    </button>
                    <button
                      type="submit"
                      disabled={loading || message.length < 20}
                      className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-[#58007E] hover:bg-[#430060] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Илгээх
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

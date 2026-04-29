/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ChevronRight, Star, Lock, ClipboardList, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── FORMSPREE CONFIG ─────────────────────────────────────────────────────────
// Kendi Formspree endpoint'ini buraya yaz:  https://formspree.io/f/XXXXXXXX
const FORMSPREE_URL = 'https://formspree.io/f/xkgbwnjq';

async function getUserIP(): Promise<string> {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const d = await r.json();
    return d.ip ?? 'Bilinmiyor';
  } catch {
    return 'Alınamadı';
  }
}

async function sendNotification(event: string, extra = '') {
  const ip = await getUserIP();
  const time = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  try {
    await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        olay: event,
        ip_adresi: ip,
        saat: time,
        ek_bilgi: extra,
      }),
    });
  } catch {
    // sessiz hata
  }
}

// ─── FLOATING HEARTS BACKGROUND ──────────────────────────────────────────────
const BackgroundHearts = () => {
  const [els] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 18,
      duration: 12 + Math.random() * 12,
      delay: Math.random() * 8,
    }))
  );
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {els.map((el) => (
        <div
          key={el.id}
          className="heart-float"
          style={{
            left: `${el.left}%`,
            '--duration': `${el.duration}s`,
            animationDelay: `${el.delay}s`,
          } as React.CSSProperties}
        >
          <Heart
            size={el.size}
            fill="rgba(255,182,193,0.35)"
            className="text-transparent"
          />
        </div>
      ))}
    </div>
  );
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SURVEY_QUESTIONS = [
  { q: 'Okul yönetiminin iletişimi sizce yeterli mi?', opts: ['Evet, yeterli', 'Hayır, yetersiz'] },
  { q: 'Bilişim altyapısı öğrenci ihtiyaçlarını karşılıyor mu?', opts: ['Evet, karşılıyor', 'Hayır, karşılamıyor'] },
  { q: 'Kantin hizmetlerinden memnun musunuz?', opts: ['Memnunum', 'Memnun değilim'] },
  { q: 'Sosyal & kültürel etkinlikler yeterli mi?', opts: ['Yeterli', 'Yetersiz'] },
  { q: 'Okul temizliği ve bakımı sizce nasıl?', opts: ['İyi durumda', 'İyileştirilmeli'] },
];

const STORY_CARDS = [
  {
    title: 'Her Şey Seninle Başladı…',
    text: 'O notu senin kalemliğine bırakırken kalbim yerinden çıkacak gibiydi. Seninle geçirdiğim her an, her mesaj benim için dünyalara bedel.',
    icon: <Sparkles className="text-rose-400" size={36} />,
  },
  {
    title: 'Sessizce Büyüyen Hislerim',
    text: 'Sana bakarken, gülüşünü izlerken hissettiğim şeyi tarif etmek çok zor. Sadece "arkadaşız" demek artık bana yetmiyor.',
    icon: <Lock className="text-rose-400" size={36} />,
  },
  {
    title: 'Seninleyken…',
    text: 'Hayatımda olduğun için ne kadar şanslı olduğumu her gün yeniden anlıyorum. Sen gerçekten benim için her şeyden daha özelsin.',
    icon: <Star className="text-rose-400" fill="#fb7185" size={36} />,
  },
];

// ─── PHASE TYPES ─────────────────────────────────────────────────────────────
type Phase = 'login' | 'survey' | 'transition' | 'ready' | 'confession';
type ConfessionStep = 'welcome' | 'story' | 'question' | 'success';

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [transitionStage, setTransitionStage] = useState(0);
  const [step, setStep] = useState<ConfessionStep>('welcome');
  const [storyIndex, setStoryIndex] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const noRef = useRef<HTMLButtonElement>(null);

  // ── LOGIN ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'leyla' && password === 'gezegen21') {
      await sendNotification('GİRİŞ YAPILDI', `Kullanıcı: ${username}`);
      setPhase('survey');
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  // ── SURVEY ──
  const handleSurveyAnswer = () => {
    if (surveyIndex < SURVEY_QUESTIONS.length - 1) {
      setSurveyIndex((i) => i + 1);
    } else {
      setPhase('transition');
    }
  };

  // ── TRANSITION ──
  useEffect(() => {
    if (phase !== 'transition') return;
    const msgs = ['Veriler kaydedildi.', 'Teşekkür ederiz.', 'Son bir adım kaldı…'];
    if (transitionStage < msgs.length - 1) {
      const t = setTimeout(() => setTransitionStage((s) => s + 1), 2200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase('ready'), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, transitionStage]);

  // ── STORY ──
  const handleNextStory = () => {
    if (storyIndex < STORY_CARDS.length - 1) setStoryIndex((i) => i + 1);
    else setStep('question');
  };

  // ── YES ──
  const handleYes = async () => {
    setStep('success');
    await sendNotification('EVET DEDİ! 💖', 'Leyla "Evet, Seninleyim" butonuna bastı!');
    const burst = () =>
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#f43f5e', '#fda4af', '#fff1f2', '#ffffff'],
      });
    burst();
    setTimeout(burst, 500);
    setTimeout(burst, 1000);
  };

  // ── NO BUTTON ESCAPE ──
  const moveNo = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const el = noRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxX = Math.min(vw / 2 - 40, 200);
    const maxY = Math.min(vh / 2 - 40, 200);
    setNoPos({
      x: (Math.random() - 0.5) * maxX * 2,
      y: (Math.random() - 0.5) * maxY * 2,
    });
  };

  // ── TRANSITIONS ──
  const transitionLines = ['Veriler kaydedildi.', 'Teşekkür ederiz.', 'Son bir adım kaldı…'];

  const pageVariants = {
    initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, filter: 'blur(6px)', transition: { duration: 0.35 } },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 select-none overflow-hidden">
      <div className="bg-overlay" />
      {(phase === 'confession' || phase === 'ready') && <BackgroundHearts />}

      <AnimatePresence mode="wait">

        {/* ── LOGIN ─────────────────────────────────────────────────────────── */}
        {phase === 'login' && (
          <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-2">
                <Lock size={22} className="text-rose-300" />
              </div>
              <h1 className="text-2xl font-display font-semibold text-white tracking-tight">Sistem Girişi</h1>
              <p className="text-sm text-white/40 font-body">Yetkili kullanıcılar için</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value.toLowerCase()); setLoginError(''); }}
                  className="input-field"
                  autoComplete="off"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  className="input-field"
                />
              </div>

              <AnimatePresence>
                {loginError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-rose-400 text-xs text-center"
                  >
                    {loginError}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button type="submit" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                className="btn-primary w-full py-3 text-sm font-semibold"
              >
                Giriş Yap
              </motion.button>
            </form>

            <p className="text-center text-[11px] text-white/20 font-body leading-relaxed">
              Yönetim bilgi sistemi — Yetkisiz erişim yasaktır
            </p>
          </motion.div>
        )}

        {/* ── SURVEY ───────────────────────────────────────────────────────── */}
        {phase === 'survey' && (
          <motion.div key={`survey-${surveyIndex}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-rose-300" />
                <span className="text-xs font-body font-semibold uppercase tracking-widest text-rose-300">
                  Anket
                </span>
              </div>
              <span className="text-xs text-white/30 font-body">
                {surveyIndex + 1} / {SURVEY_QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-display font-medium text-white leading-snug">
                {SURVEY_QUESTIONS[surveyIndex].q}
              </h2>
            </div>

            <div className="space-y-3">
              {SURVEY_QUESTIONS[surveyIndex].opts.map((opt) => (
                <motion.button
                  key={opt}
                  onClick={handleSurveyAnswer}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(251,113,133,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  className="survey-opt w-full text-left px-5 py-3.5 text-sm font-body text-white/80 rounded-xl border border-white/10 bg-white/5 transition-colors"
                >
                  {opt}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-1.5 justify-center pt-2">
              {SURVEY_QUESTIONS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === surveyIndex ? 24 : 6, opacity: i <= surveyIndex ? 1 : 0.25 }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full bg-rose-400"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TRANSITION ───────────────────────────────────────────────────── */}
        {phase === 'transition' && (
          <motion.div key={`trans-${transitionStage}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="z-10 text-center space-y-4 px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <CheckCircle2 size={48} className="text-rose-400 mx-auto mb-6" />
            </motion.div>
            <p className="text-3xl font-display font-semibold text-white">
              {transitionLines[transitionStage]}
            </p>
            <div className="flex justify-center gap-1 pt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: i === transitionStage ? 1 : 0.2, scale: i === transitionStage ? 1.3 : 1 }}
                  className="w-2 h-2 rounded-full bg-rose-400"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── READY ────────────────────────────────────────────────────────── */}
        {phase === 'ready' && (
          <motion.div key="ready" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-xs text-center space-y-10"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Lock size={72} className="text-rose-400 mx-auto drop-shadow-lg" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-4xl font-display font-semibold text-white">Hazır mısın?</h2>
              <p className="text-white/40 font-body text-sm">Sana özel bir şey var…</p>
            </div>
            <motion.button
              onClick={() => { setPhase('confession'); setStep('welcome'); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-primary w-full py-4 text-lg font-semibold font-display"
            >
              Hazırım ✨
            </motion.button>
          </motion.div>
        )}

        {/* ── CONFESSION ───────────────────────────────────────────────────── */}
        {phase === 'confession' && (
          <AnimatePresence mode="wait">

            {/* WELCOME */}
            {step === 'welcome' && (
              <motion.div key="welcome" variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-8 flex flex-col items-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center ring-2 ring-rose-400/30"
                >
                  <Lock size={40} className="text-rose-400 drop-shadow" />
                </motion.div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-display font-semibold text-white leading-tight">
                    Sana en samimi <br />
                    <span className="text-rose-400">duygularımla…</span>
                  </h1>
                  <p className="text-white/50 font-body text-sm leading-relaxed">
                    Bu uygulamayı senin için özel olarak kodladım.
                    İçimdeki her şeyi seninle paylaşmak istedim.
                  </p>
                </div>

                <motion.button
                  onClick={() => setStep('story')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-display text-base font-semibold"
                >
                  Okumaya Başla <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}

            {/* STORY */}
            {step === 'story' && (
              <motion.div key={`story-${storyIndex}`}
                initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ opacity: 0, x: -60, filter: 'blur(6px)', transition: { duration: 0.3 } }}
                className="glass-card z-10 w-full max-w-sm p-10 space-y-6 flex flex-col items-center text-center min-h-[440px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center ring-1 ring-rose-400/20">
                  {STORY_CARDS[storyIndex].icon}
                </div>

                <h2 className="text-xl font-display font-semibold text-rose-300">
                  {STORY_CARDS[storyIndex].title}
                </h2>

                <p className="text-white/65 font-body text-sm leading-relaxed flex-1 italic">
                  "{STORY_CARDS[storyIndex].text}"
                </p>

                <div className="w-full flex items-center justify-between pt-4 mt-auto">
                  <div className="flex gap-1.5">
                    {STORY_CARDS.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ width: i === storyIndex ? 20 : 6, opacity: i <= storyIndex ? 1 : 0.2 }}
                        className="h-1.5 rounded-full bg-rose-400"
                      />
                    ))}
                  </div>
                  <motion.button
                    onClick={handleNextStory}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300"
                  >
                    <ChevronRight size={22} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* QUESTION */}
            {step === 'question' && (
              <motion.div key="question" variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-8 flex flex-col items-center overflow-visible"
              >
                <motion.div
                  animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                >
                  <Lock size={80} className="text-rose-400 drop-shadow-xl" />
                </motion.div>

                <div className="space-y-4">
                  <p className="text-white/50 font-body text-sm uppercase tracking-widest">Gezegenin en güzel yeri</p>
                  <h2 className="text-3xl font-display font-bold text-white leading-snug">
                    senin kalbin
                    <span className="block text-rose-400">Leyla.</span>
                  </h2>
                  <p className="text-white/55 font-body text-sm leading-relaxed">
                    Hayatımın kodlarını seninle birlikte yazmak istiyorum. <br />
                    Benimle olur musun?
                  </p>
                </div>

                <div className="w-full space-y-4 relative">
                  <motion.button
                    onClick={handleYes}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-primary w-full py-4 text-base font-display font-semibold"
                  >
                    Evet, Seninleyim ❤️
                  </motion.button>

                  <div className="h-12 flex items-center justify-center overflow-visible">
                    <motion.button
                      ref={noRef}
                      onPointerEnter={moveNo}
                      onPointerDown={moveNo}
                      onTouchStart={moveNo}
                      animate={{ x: noPos.x, y: noPos.y }}
                      transition={{ type: 'spring', stiffness: 700, damping: 28 }}
                      className="text-xs text-white/20 hover:text-white/30 italic font-body cursor-default touch-none"
                    >
                      Belki başka zaman…
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-8 flex flex-col items-center"
              >
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: 'easeOut' }}
                    >
                    <Lock size={80} className="text-rose-400 drop-shadow-xl relative z-10" />
                  </motion.div>
                </div>

                <div className="space-y-3 pt-4">
                  <h1 className="text-3xl font-display font-bold text-white leading-tight">
                    Artık dünyanın en <br />
                    <span className="text-rose-400">şanslı insanıyım!</span>
                  </h1>
                  <p className="text-white/60 font-body text-sm leading-relaxed italic">
                    Seni çok seviyorum. Yazdığım en anlamlı kod<br />
                    ve hayatımın en güzel anı bu oldu… ❤️
                  </p>
                </div>

                <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />

                <button
                  onClick={() => {
                    setPhase('login'); setStep('welcome');
                    setStoryIndex(0); setSurveyIndex(0);
                    setTransitionStage(0); setUsername(''); setPassword('');
                  }}
                  className="text-[11px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors font-body"
                >
                  Başa Dön
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-5 left-0 right-0 text-center z-0 pointer-events-none">
        <p className="font-display italic text-[10px] tracking-widest uppercase text-white/10">
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TIMP_TOTAL = 150;
const MAX_GRESELI = 2;

interface IntrebarePrimita {
  index: number;
  total: number;
  intrebare: string;
  optiuni: string[];
}

function TestRadioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cod = searchParams.get('cod');

  const [intrebareCurenta, setIntrebareCurenta] = useState<IntrebarePrimita | null>(null);
  const [totalIntrebari, setTotalIntrebari] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [indexCurent, setIndexCurent] = useState(0);
  const [optiuneSelectata, setOptiuneSelectata] = useState<string | null>(null);
  const [greseli, setGreseli] = useState(0);
  const [timpRamas, setTimpRamas] = useState(TIMP_TOTAL);
  const [stare, setStare] = useState<'activ' | 'promovat' | 'picat'>('activ');
  const [motivFinal, setMotivFinal] = useState('');
  const [feedback, setFeedback] = useState<'corect' | 'gresit' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timpRamasRef = useRef(TIMP_TOTAL);
  const greseliRef = useRef(0);
  const stareRef = useRef<'activ' | 'promovat' | 'picat'>('activ');
  const intrebariGresiteRef = useRef<any[]>([]);
  const motivRef = useRef('');

  const incarcaIntrebare = useCallback(async (index: number, isFirstLoad = false) => {
    if (isFirstLoad) setIsInitialLoading(true);
    try {
      const res = await fetch(`/api/test/radio/question?index=${index}&cod=${cod ?? ''}`);
      if (!res.ok) throw new Error('Eroare server');
      const data: IntrebarePrimita = await res.json();
      setIntrebareCurenta(data);
      setTotalIntrebari(data.total);
    } catch (e) {
      console.error('Eroare la încărcarea întrebării:', e);
    } finally {
      setIsInitialLoading(false);
    }
  }, [cod]);

  useEffect(() => { incarcaIntrebare(0, true); }, [incarcaIntrebare]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stareRef.current === 'activ') terminaTest('anticheat');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (stare !== 'activ') return;
    const interval = setInterval(() => {
      timpRamasRef.current -= 1;
      setTimpRamas(timpRamasRef.current);
      if (timpRamasRef.current <= 0) { clearInterval(interval); terminaTest('timp_expirat'); }
    }, 1000);
    return () => clearInterval(interval);
  }, [stare]);

  const terminaTest = useCallback((motiv: string) => {
    if (stareRef.current !== 'activ') return;
    const admis = greseliRef.current <= MAX_GRESELI && motiv === 'finalizat';
    motivRef.current = motiv;
    stareRef.current = admis ? 'promovat' : 'picat';
    setMotivFinal(motiv);
    setStare(admis ? 'promovat' : 'picat');
  }, []);

  const handleConfirm = async () => {
    if (!optiuneSelectata || feedback || !intrebareCurenta) return;
    let corect = false;
    let raspunsCorect = '';
    try {
      const res = await fetch('/api/test/radio/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: indexCurent, raspunsUser: optiuneSelectata, cod: cod ?? '' }),
      });
      const data = await res.json();
      corect = data.corect;
      raspunsCorect = data.raspunsCorect ?? '';
    } catch (e) {
      console.error('Eroare la verificare:', e);
      return;
    }

    if (!corect) {
      setFeedback('gresit');
      intrebariGresiteRef.current.push({
        intrebare: intrebareCurenta.intrebare,
        raspunsdat: optiuneSelectata,
        raspunsCorect,
      });
      greseliRef.current += 1;
      setGreseli(greseliRef.current);
      if (greseliRef.current > MAX_GRESELI) { setTimeout(() => terminaTest('greseli_maxime'), 600); return; }
    } else {
      setFeedback('corect');
    }

    setTimeout(async () => {
      setFeedback(null);
      setOptiuneSelectata(null);
      const urmatorulIndex = indexCurent + 1;
      if (urmatorulIndex >= totalIntrebari) {
        terminaTest('finalizat');
      } else {
        setIndexCurent(urmatorulIndex);
        await incarcaIntrebare(urmatorulIndex);
      }
    }, 600);
  };

  useEffect(() => {
    if ((stare === 'picat' || stare === 'promovat') && !submitting) {
      if (!cod) return;
      setSubmitting(true);
      fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cod,
          greseli: greseliRef.current,
          timpRamas: timpRamasRef.current,
          intrebariGresite: intrebariGresiteRef.current,
          motiv: motivRef.current,
        }),
      }).catch(console.error);
    }
  }, [stare, cod, submitting]);

  const formatTimp = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const cardStyle = {
    background: 'rgba(18,14,12,0.72)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
    overflow: 'hidden',
  };

  if (isInitialLoading || !intrebareCurenta) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid rgba(192,57,43,0.2)',
            borderTop: '2px solid #C0392B',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            Se încarcă...
          </p>
        </div>
      </main>
    );
  }

  if (stare === 'picat' || stare === 'promovat') {
    const admis = stare === 'promovat';
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 440, ...cardStyle }}>
            <div style={{ height: 2, background: admis ? 'linear-gradient(to right, transparent, #22c55e, transparent)' : 'linear-gradient(to right, transparent, #C0392B, transparent)' }} />
            <div style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: admis ? 'rgba(34,197,94,0.1)' : 'rgba(192,57,43,0.1)',
                  border: `1px solid ${admis ? 'rgba(34,197,94,0.2)' : 'rgba(192,57,43,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {admis ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  )}
                </div>
              </div>

              <div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.06em', color: '#F0EAE8', margin: 0 }}>
                  {admis ? 'ADMIS' : 'RESPINS'}
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                  {admis ? 'Felicitări! Ai trecut testul teoretic.' : (motivFinal === 'anticheat' ? 'Sistemul a detectat părăsirea paginii.' : 'Ai acumulat numărul maxim de greșeli permise.')}
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Greșeli', value: `${greseli}/3`, red: !admis },
                  { label: 'Timp', value: formatTimp(TIMP_TOTAL - timpRamas), red: false },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '14px 0',
                  }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.05em', color: stat.red ? '#C0392B' : '#F0EAE8' }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  width: '100%', padding: '15px',
                  background: '#C0392B', border: 'none', borderRadius: 12,
                  fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(192,57,43,0.35)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
                onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
              >
                Înapoi la Dashboard
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const progress = ((indexCurent + 1) / totalIntrebari) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .test-card { animation: fadeIn 0.3s ease both; }
        .opt-btn { transition: all 0.15s ease; }
        .opt-btn:hover:not(:disabled) { border-color: rgba(192,57,43,0.5) !important; background: rgba(192,57,43,0.06) !important; }
      `}</style>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
        <div className="test-card" style={{ width: '100%', maxWidth: 500, ...cardStyle }}>

          {/* Accent top */}
          <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #C0392B, transparent)' }} />

          <div style={{ padding: '28px 28px 24px' }}>

            {/* Header timp + greseli */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>Timp Rămas</p>
                <p style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.05em',
                  color: timpRamas < 60 ? '#C0392B' : '#F0EAE8',
                  animation: timpRamas < 60 ? 'pulse 1s infinite' : 'none',
                }}>
                  {formatTimp(timpRamas)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>Greșeli</p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.05em', color: '#C0392B' }}>{greseli}/3</p>
              </div>
            </div>

            {/* Întrebare */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: '#F0EAE8', lineHeight: 1.5 }}>
                {intrebareCurenta.intrebare}
              </p>
            </div>

            {/* Opțiuni */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {intrebareCurenta.optiuni.map((optiune, i) => {
                const isActive = optiuneSelectata === optiune;
                const litera = String.fromCharCode(65 + i);
                return (
                  <button
                    key={i}
                    className="opt-btn"
                    disabled={!!feedback}
                    onClick={() => setOptiuneSelectata(optiune)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                      background: isActive ? 'rgba(192,57,43,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? '#C0392B' : 'rgba(255,255,255,0.07)'}`,
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: isActive ? '0 0 20px rgba(192,57,43,0.15)' : 'none',
                      cursor: feedback ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
                      background: isActive ? 'rgba(192,57,43,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? 'rgba(192,57,43,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? '#C0392B' : 'rgba(255,255,255,0.3)',
                    }}>
                      {litera}
                    </span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: isActive ? '#F0EAE8' : 'rgba(255,255,255,0.7)' }}>
                      {optiune}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress + buton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#C0392B', borderRadius: 999, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                  {indexCurent + 1} / {totalIntrebari}
                </span>
                <button
                  onClick={handleConfirm}
                  disabled={!optiuneSelectata || !!feedback}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    background: (!optiuneSelectata || !!feedback) ? 'rgba(255,255,255,0.05)' : '#C0392B',
                    color: (!optiuneSelectata || !!feedback) ? 'rgba(255,255,255,0.2)' : '#fff',
                    cursor: (!optiuneSelectata || !!feedback) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: (!optiuneSelectata || !!feedback) ? 'none' : '0 4px 16px rgba(192,57,43,0.3)',
                  }}
                >
                  {feedback ? 'verificare...' : 'Următoarea →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function TestRadio() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <TestRadioContent />
    </Suspense>
  );
}
'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TIMP_TOTAL = 180;
const MAX_GRESELI = 2;

interface IntrebarePrimita {
  index: number;
  total: number;
  intrebare: string;
  optiuni: string[];
}

function TestBLSContent() {
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
  const isSubmittingAnswerRef = useRef(false); // ✅ guard anti-spam

  const verificaStatusCod = useCallback(async () => {
    if (!cod) return;
    try {
      const res = await fetch(`/api/test/check?cod=${cod}`);
      const data = await res.json();
      if (data.used) {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error("Eroare verificare status cod:", e);
    }
  }, [cod, router]);

  useEffect(() => {
    verificaStatusCod();
  }, [verificaStatusCod]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stareRef.current === 'activ' && cod) {
        const payload = JSON.stringify({
          cod,
          greseli: greseliRef.current,
          timpRamas: timpRamasRef.current,
          intrebariGresite: intrebariGresiteRef.current,
          motiv: 'refresh_pagina',
        });
        navigator.sendBeacon('/api/test/submit', payload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cod]);

  const incarcaIntrebare = useCallback(async (index: number, isFirstLoad = false) => {
    if (isFirstLoad) setIsInitialLoading(true);
    try {
      const res = await fetch(`/api/test/bls/question?index=${index}&cod=${cod ?? ''}`);
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
    if (isSubmittingAnswerRef.current) return; // ✅ blochează click-uri repetate instant
    isSubmittingAnswerRef.current = true;

    let corect = false;
    let raspunsCorect = '';
    try {
      const res = await fetch('/api/test/bls/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: indexCurent, raspunsUser: optiuneSelectata, cod: cod ?? '' }),
      });
      const data = await res.json();
      corect = data.corect;
      raspunsCorect = data.raspunsCorect ?? '';
    } catch (e) {
      console.error('Eroare la verificare:', e);
      isSubmittingAnswerRef.current = false; // ✅ eliberează și la eroare
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
      isSubmittingAnswerRef.current = false; // ✅ eliberează abia la trecerea la întrebarea următoare
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
      if (motivRef.current === 'refresh_pagina') return;

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
    background: 'rgba(15,10,10,0.72)',
    backdropFilter: 'blur(32px) saturate(140%)',
    WebkitBackdropFilter: 'blur(32px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 28,
    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow: 'hidden',
  };

  if (isInitialLoading || !intrebareCurenta) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid rgba(255,59,78,0.2)',
            borderTop: '2px solid #FF3B4E',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;600&display=swap');`}</style>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 2 }}>
          <div style={{ width: '100%', maxWidth: 440, ...cardStyle }}>
            <div style={{ padding: '44px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: admis ? 'rgba(34,197,94,0.1)' : 'rgba(255,59,78,0.1)',
                  border: `1px solid ${admis ? 'rgba(34,197,94,0.25)' : 'rgba(255,59,78,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: admis ? '0 0 30px rgba(34,197,94,0.15)' : '0 0 30px rgba(255,59,78,0.15)',
                }}>
                  {admis ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  )}
                </div>
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 42,
                  letterSpacing: '-0.01em',
                  color: admis ? '#E5E1E6' : undefined,
                  margin: 0,
                  ...(admis ? {} : {
                    background: 'linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }),
                }}>
                  {admis ? 'ADMIS' : 'RESPINS'}
                </h2>
                <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 13.5, color: 'rgba(229,225,230,0.55)', marginTop: 10, lineHeight: 1.6 }}>
                  {admis ? 'Felicitări! Ai trecut testul teoretic.' :
                    (motivFinal === 'anticheat' ? 'Sistemul a detectat părăsirea paginii (Tab Switch).' :
                     motivFinal === 'refresh_pagina' ? 'Anticheat: Candidatul a dat refresh la pagină în timpul testului.' :
                     'Ai acumulat numărul maxim de greșeli permise.')}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Greșeli', value: `${greseli}/3`, red: !admis },
                  { label: 'Timp', value: formatTimp(TIMP_TOTAL - timpRamas), red: false },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 0' }}>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: stat.red ? '#FF3B4E' : '#E5E1E6' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%)',
                  border: 'none', borderRadius: 14,
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 13.5, fontWeight: 600,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(255,59,78,0.35)',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,59,78,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,59,78,0.35)'; }}
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .test-card { animation: fadeIn 0.35s ease both; }
        .opt-btn { transition: all 0.2s ease; }
        .opt-btn:hover:not(:disabled) { border-color: rgba(255,59,78,0.5) !important; background: rgba(255,59,78,0.06) !important; }
      `}</style>
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px', position: 'relative', zIndex: 2 }}>
        <div className="test-card" style={{ width: '100%', maxWidth: 520, ...cardStyle }}>
          <div style={{ padding: '32px 30px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 26 }}>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>Timp Rămas</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: timpRamas < 60 ? '#FF3B4E' : '#E5E1E6' }}>{formatTimp(timpRamas)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>Greșeli</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#FF3B4E' }}>{greseli}/3</p>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#E5E1E6', lineHeight: 1.55 }}>{intrebareCurenta.intrebare}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
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
                      padding: '13px 15px', borderRadius: 14, textAlign: 'left',
                      background: isActive ? 'linear-gradient(135deg, rgba(255,59,78,0.16) 0%, rgba(191,0,42,0.1) 100%)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? '#FF3B4E' : 'rgba(255,255,255,0.08)'}`,
                      cursor: feedback ? 'default' : 'pointer',
                      boxShadow: isActive ? '0 4px 20px rgba(255,59,78,0.15)' : 'none',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
                      background: isActive ? 'rgba(255,59,78,0.2)' : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#FF3B4E' : 'rgba(255,255,255,0.35)',
                    }}>{litera}</span>
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 13.5, fontWeight: 400, color: isActive ? '#E5E1E6' : 'rgba(229,225,230,0.75)' }}>{optiune}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FF3B4E, #bf002a)', transition: 'width 0.5s ease', boxShadow: '0 0 12px rgba(255,59,78,0.5)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{indexCurent + 1} / {totalIntrebari}</span>
                <button
                  onClick={handleConfirm}
                  disabled={!optiuneSelectata || !!feedback}
                  style={{
                    padding: '11px 26px', borderRadius: 12, border: 'none',
                    fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
                    background: (!optiuneSelectata || !!feedback) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%)',
                    color: (!optiuneSelectata || !!feedback) ? 'rgba(255,255,255,0.25)' : '#fff',
                    cursor: (!optiuneSelectata || !!feedback) ? 'not-allowed' : 'pointer',
                    boxShadow: (!optiuneSelectata || !!feedback) ? 'none' : '0 6px 24px rgba(255,59,78,0.35)',
                    transition: 'all 0.25s ease',
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

export default function TestBLS() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <TestBLSContent />
    </Suspense>
  );
}
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

  if (isInitialLoading || !intrebareCurenta) {
    return (
      <main className="min-h-screen bg-[#0F0D0D] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C0392B]"></div>
          <p className="font-bold uppercase tracking-widest text-sm">Se încarcă testul...</p>
        </div>
      </main>
    );
  }

  if (stare === 'picat' || stare === 'promovat') {
    const admis = stare === 'promovat';
    return (
      <main className="min-h-screen bg-[#0F0D0D] flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl overflow-hidden relative">
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${admis ? 'bg-green-500' : 'bg-[#C0392B]'}`} />
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              {admis ? (
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-black text-[#F0EAE8] tracking-tight">{admis ? 'ADMIS' : 'RESPINS'}</h2>
            <p className="text-[#8A7E7C] text-sm leading-relaxed">
              {admis ? 'Felicitări! Ai trecut testul teoretic.' : (motivFinal === 'anticheat' ? 'Sistemul a detectat părăsirea paginii în timpul examinării.' : 'Ai acumulat numărul maxim de greșeli permise.')}
            </p>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724] text-center">
                <p className="text-[10px] uppercase font-bold text-[#8A7E7C] mb-1">Greșeli</p>
                <p className={`text-lg font-black ${admis ? 'text-[#F0EAE8]' : 'text-[#C0392B]'}`}>{greseli}/3</p>
              </div>
              <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724] text-center">
                <p className="text-[10px] uppercase font-bold text-[#8A7E7C] mb-1">Timp</p>
                <p className="text-lg font-black text-[#F0EAE8]">{formatTimp(TIMP_TOTAL - timpRamas)}</p>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-lg font-bold uppercase tracking-widest transition-all active:scale-95">
              Înapoi la Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0D0D] text-[#e8e1e0] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(192,57,43,0.08)_0%,rgba(15,13,13,0)_70%)] pointer-events-none" />

      <div className="flex-grow flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C0392B]" />

          <div className="p-8 space-y-6">
            {/* Header timp + greseli */}
            <div className="flex justify-between items-center pb-4 border-b border-[#2E2724]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Timp Rămas</p>
                <div className={`text-lg font-black tabular-nums ${timpRamas < 60 ? 'text-[#C0392B] animate-pulse' : 'text-[#F0EAE8]'}`}>
                  {formatTimp(timpRamas)}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Greșeli</p>
                <div className="text-lg font-black text-[#C0392B]">{greseli}/3</div>
              </div>
            </div>

            {/* Întrebare */}
            <header>
              <h2 className="text-xl font-bold text-[#F0EAE8] leading-tight">
                {intrebareCurenta.intrebare}
              </h2>
            </header>

            {/* Opțiuni cu litere A B C D */}
            <section className="space-y-3">
              {intrebareCurenta.optiuni.map((optiune, i) => {
                const isActive = optiuneSelectata === optiune;
                const litera = String.fromCharCode(65 + i);
                return (
                  <button
                    key={i}
                    disabled={!!feedback}
                    onClick={() => setOptiuneSelectata(optiune)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group
                      ${isActive
                        ? 'bg-[#C0392B] border-[#C0392B] shadow-lg shadow-[#C0392B]/10'
                        : 'bg-[#231E1C] border-[#2E2724] hover:border-[#C0392B] hover:bg-[#C0392B]/5'
                      }`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors
                      ${isActive
                        ? 'bg-[#F0EAE8]/10 border border-[#F0EAE8]/20 text-[#F0EAE8]'
                        : 'bg-[#1A1614] border border-[#2E2724] text-[#8A7E7C] group-hover:border-[#C0392B] group-hover:text-[#C0392B]'
                      }`}>
                      {litera}
                    </span>
                    <span className="text-[13px] font-medium text-[#F0EAE8]">{optiune}</span>
                  </button>
                );
              })}
            </section>

            {/* Progress + buton */}
            <div className="space-y-4 pt-2">
              <div className="w-full bg-[#231E1C] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#C0392B] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((indexCurent + 1) / totalIntrebari) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8A7E7C] font-medium uppercase tracking-wider">
                  Întrebarea {indexCurent + 1} din {totalIntrebari}
                </span>
                <button
                  onClick={handleConfirm}
                  disabled={!optiuneSelectata || !!feedback}
                  className="py-3 px-8 bg-[#C0392B] disabled:opacity-30 text-[#F0EAE8] rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#A93226] transition-all active:scale-[0.98]"
                >
                  {feedback ? 'Se verifică...' : 'Următoarea →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TestBLS() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0D0D]" />}>
      <TestBLSContent />
    </Suspense>
  );
}
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
  const [isLoading, setIsLoading] = useState(true);
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

  const incarcaIntrebare = useCallback(async (index: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/test/smuls-teoretic/question?index=${index}&cod=${cod ?? ''}`);
      if (!res.ok) throw new Error('Eroare server');
      const data: IntrebarePrimita = await res.json();
      setIntrebareCurenta(data);
      setTotalIntrebari(data.total);
    } catch (e) {
      console.error('Eroare la încărcarea întrebării:', e);
    } finally {
      setIsLoading(false);
    }
  }, [cod]);

  useEffect(() => { incarcaIntrebare(0); }, [incarcaIntrebare]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stareRef.current === 'activ') terminaTest('anticheat');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (stare !== 'activ' || isLoading) return;
    const interval = setInterval(() => {
      timpRamasRef.current -= 1;
      setTimpRamas(timpRamasRef.current);
      if (timpRamasRef.current <= 0) { clearInterval(interval); terminaTest('timp_expirat'); }
    }, 1000);
    return () => clearInterval(interval);
  }, [stare, isLoading]);

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
      const res = await fetch('/api/test/smuls-teoretic/verify', {
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
        raspunsCorect: raspunsCorect,
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

  if (isLoading || !intrebareCurenta) {
    return <main className="min-h-screen bg-[#0F0D0D] flex items-center justify-center text-white">Se încarcă testul...</main>;
  }

  if (stare === 'picat' || stare === 'promovat') {
    const admis = stare === 'promovat';
    return (
      <main className="min-h-screen bg-[#0F0D0D] flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl overflow-hidden relative">
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${admis ? 'bg-green-500' : 'bg-[#C0392B]'}`} />
          <div className="p-8 text-center space-y-6">
            <h2 className="text-3xl font-black text-[#F0EAE8]">{admis ? 'ADMIS' : 'RESPINS'}</h2>
            <p className="text-[#8A7E7C] text-sm">{admis ? 'Felicitări!' : (motivFinal === 'anticheat' ? 'Ai părăsit pagina.' : 'Prea multe greșeli.')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724]">
                <p className="text-[10px] uppercase font-bold text-[#8A7E7C]">Greșeli</p>
                <p className={`text-lg font-black ${admis ? 'text-white' : 'text-red-500'}`}>{greseli}/3</p>
              </div>
              <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724]">
                <p className="text-[10px] uppercase font-bold text-[#8A7E7C]">Timp</p>
                <p className="text-lg font-black text-white">{formatTimp(TIMP_TOTAL - timpRamas)}</p>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-[#C0392B] text-white rounded-lg font-bold uppercase">Înapoi la Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0D0D] text-[#e8e1e0] flex flex-col relative">
      <div className="flex-grow flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl p-8 space-y-6">
          <div className="flex justify-between border-b border-[#2E2724] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#8A7E7C]">Timp Rămas</p>
              <p className="text-lg font-black">{formatTimp(timpRamas)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-[#8A7E7C]">Greșeli</p>
              <p className="text-lg font-black text-[#C0392B]">{greseli}/3</p>
            </div>
          </div>
          <header>
            <p className="text-[10px] font-bold text-[#C0392B] uppercase">Întrebarea {indexCurent + 1} / {totalIntrebari}</p>
            <h2 className="text-xl font-bold text-[#F0EAE8] mt-2">{intrebareCurenta.intrebare}</h2>
          </header>
          <section className="space-y-3">
            {intrebareCurenta.optiuni.map((optiune, i) => (
              <button key={i} disabled={!!feedback} onClick={() => setOptiuneSelectata(optiune)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${optiuneSelectata === optiune ? 'bg-[#C0392B] border-[#C0392B]' : 'bg-[#231E1C] border-[#2E2724]'}`}>
                <span className="text-sm">{optiune}</span>
              </button>
            ))}
          </section>
          <button onClick={handleConfirm} disabled={!optiuneSelectata || !!feedback}
            className="w-full py-4 bg-[#C0392B] disabled:opacity-30 text-white rounded-lg font-bold uppercase">
            {feedback ? 'Procesare...' : 'Confirmă'}
          </button>
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
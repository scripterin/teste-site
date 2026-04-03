'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const INTREBARI = [
  {
    id: 1,
    intrebare: 'Ești la o intervenție unde se aud focuri de armă și există risc major. Ce mesaj corect transmiți?',
    optiuni: [
      'M-CALLSIGN, 10-50',
      'M-CALLSIGN, 10-11',
      'M-CALLSIGN, 10-0, 10-20 <locația>',
      'M-CALLSIGN, 10-33'
    ],
    raspunsCorect: 'M-CALLSIGN, 10-0, 10-20 <locația>'
  },
  {
    id: 2,
    intrebare: 'Primești un mesaj radio dar nu l-ai înțeles complet. Cum răspunzi corect?',
    optiuni: [
      '10-4',
      '10-1',
      '10-20',
      '10-9'
    ],
    raspunsCorect: '10-9'
  },
  {
    id: 3,
    intrebare: 'Ajungi la locul solicitării și constați că nu este nimeni acolo. Ce cod utilizezi?',
    optiuni: [
      '10-11',
      '10-0',
      '10-50',
      '10-55'
    ],
    raspunsCorect: '10-11'
  },
  {
    id: 4,
    intrebare: 'Cum soliciți liniște pe stație pentru o intervenție importantă?',
    optiuni: [
      '10-20',
      '10-33',
      '10-39',
      '10-78'
    ],
    raspunsCorect: '10-33'
  },
  {
    id: 5,
    intrebare: 'Ești în deplasare către o intervenție și vrei să anunți acest lucru. Ce mesaj este corect?',
    optiuni: [
      'M-CALLSIGN, 10-55',
      'M-CALLSIGN, 10-4',
      'M-CALLSIGN, 10-76',
      'M-CALLSIGN, 10-41'
    ],
    raspunsCorect: 'M-CALLSIGN, 10-76'
  },
  {
    id: 6,
    intrebare: 'La fața locului situația scapă de sub control și ai nevoie urgent de ajutor. Ce cod folosești?',
    optiuni: [
      '10-1',
      '10-78',
      '10-95',
      '10-100'
    ],
    raspunsCorect: '10-78'
  },
  {
    id: 7,
    intrebare: 'Cum anunți finalizarea unui apel?',
    optiuni: [
      '10-76',
      '10-50',
      '10-33',
      '10-55'
    ],
    raspunsCorect: '10-55'
  },
  {
    id: 8,
    intrebare: 'Ai un pacient conștient aflat în custodie și îl transporți la spital. Ce variantă este corectă?',
    optiuni: [
      'M-CALLSIGN, 10-50, 10-20',
      'M-CALLSIGN, 10-95 conștient, 10-76 spital',
      'M-CALLSIGN, 10-95 inconștient, 10-76 spital',
      'M-CALLSIGN, 10-78'
    ],
    raspunsCorect: 'M-CALLSIGN, 10-95 conștient, 10-76 spital'
  },
  {
    id: 9,
    intrebare: 'Ce cod este utilizat pentru a anunța regruparea?',
    optiuni: [
      '10-39',
      '10-20',
      '10-33',
      '10-76'
    ],
    raspunsCorect: '10-39'
  },
  {
    id: 10,
    intrebare: 'Codul de asistență 78 semnifică:',
    optiuni: [
      'Apel finalizat',
      'Necesitate poliție',
      'Asistență suplimentară',
      'Închidere stație'
    ],
    raspunsCorect: 'Asistență suplimentară'
  },
  {
    id: 11,
    intrebare: 'Primești informația că zona este sigură și poți interveni. Ce cod de asistență corespunde?',
    optiuni: [
      '5',
      '6',
      '7',
      '0'
    ],
    raspunsCorect: '6'
  },
  {
    id: 12,
    intrebare: 'Ești implicat într-un accident și nu mai poți ajunge la apelul inițial. Cum formulezi corect mesajul?',
    optiuni: [
      'M-CALLSIGN, 10-50 major/minor, nu mai pot ajunge',
      'M-CALLSIGN, 10-55',
      'M-CALLSIGN, 10-11',
      'M-CALLSIGN, 10-33'
    ],
    raspunsCorect: 'M-CALLSIGN, 10-50 major/minor, nu mai pot ajunge'
  }
];

const TIMP_TOTAL = 150;
const MAX_GRESELI = 2;

function TestRadioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cod = searchParams.get('cod');

  const [indexCurent, setIndexCurent] = useState(0);
  const [optiuneSelectata, setOptiuneSelectata] = useState(null);
  const [greseli, setGreseli] = useState(0);
  const [timpRamas, setTimpRamas] = useState(TIMP_TOTAL);
  const [stare, setStare] = useState('activ');
  const [motivFinal, setMotivFinal] = useState('');
  const [intrebariGresite, setIntrebariGresite] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const timpRamasRef = useRef(TIMP_TOTAL);
  const greseliRef = useRef(0);
  const stareRef = useRef('activ');
  const intrebariGresiteRef = useRef([]);
  const motivFinalRef = useRef('');
  const submitFiredRef = useRef(false);

  // Anticheat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stareRef.current === 'activ') {
        terminaTest('anticheat');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer
  useEffect(() => {
    if (stare !== 'activ') return;
    const interval = setInterval(() => {
      timpRamasRef.current -= 1;
      setTimpRamas(timpRamasRef.current);
      if (timpRamasRef.current <= 0) {
        clearInterval(interval);
        terminaTest('timp_expirat');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stare]);

  const submitRezultat = useCallback((motiv) => {
    if (submitFiredRef.current) return;
    submitFiredRef.current = true;

    setSubmitting(true);
    fetch('/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod,
        greseli: greseliRef.current,
        timpRamas: timpRamasRef.current,
        intrebariGresite: intrebariGresiteRef.current,
        motiv,
      }),
    })
      .catch(console.error)
      .finally(() => setSubmitting(false));
  }, [cod]);

  const terminaTest = useCallback((motiv) => {
    if (stareRef.current !== 'activ') return;
    const admis = greseliRef.current <= MAX_GRESELI && motiv === 'finalizat';
    stareRef.current = admis ? 'promovat' : 'picat';
    motivFinalRef.current = motiv;

    submitRezultat(motiv);

    setMotivFinal(motiv);
    setStare(admis ? 'promovat' : 'picat');
  }, [submitRezultat]);

  const handleConfirm = () => {
    if (optiuneSelectata === null || !!feedback) return;

    const intrebareCurenta = INTREBARI[indexCurent];
    const esteGresit = optiuneSelectata !== intrebareCurenta.raspunsCorect;

    if (esteGresit) {
      setFeedback('gresit');
      const nouaGreseala = {
        intrebare: intrebareCurenta.intrebare,
        raspunsdat: optiuneSelectata,
        raspunsCorect: intrebareCurenta.raspunsCorect,
      };
      intrebariGresiteRef.current.push(nouaGreseala);
      greseliRef.current += 1;
      setGreseli(greseliRef.current);

      if (greseliRef.current > MAX_GRESELI) {
        setTimeout(() => terminaTest('greseli_maxime'), 600);
        return;
      }
    } else {
      setFeedback('corect');
    }

    setTimeout(() => {
      setFeedback(null);
      setOptiuneSelectata(null);
      if (indexCurent + 1 >= INTREBARI.length) {
        terminaTest('finalizat');
      } else {
        setIndexCurent((prev) => prev + 1);
      }
    }, 600);
  };

  const formatTimp = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- UI: Ecran Final ---
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
             <p className="text-[#8A7E7C] text-sm">
                {admis ? 'Felicitări! Ai trecut testul teoretic RADIO.' : (motivFinal === 'anticheat' ? 'Sistem detectat: părăsirea paginii.' : 'Limita de greșeli atinsă.')}
             </p>
             <div className="grid grid-cols-2 gap-3 py-2">
                <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724]">
                  <p className="text-[10px] uppercase font-bold text-[#8A7E7C] mb-1">Greșeli</p>
                  <p className={`text-lg font-black ${admis ? 'text-[#F0EAE8]' : 'text-[#C0392B]'}`}>{greseli}/3</p>
                </div>
                <div className="bg-[#231E1C] p-3 rounded-lg border border-[#2E2724]">
                  <p className="text-[10px] uppercase font-bold text-[#8A7E7C] mb-1">Timp</p>
                  <p className="text-lg font-black text-[#F0EAE8]">{formatTimp(TIMP_TOTAL - timpRamas)}</p>
                </div>
             </div>
             <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-[#C0392B] text-[#F0EAE8] rounded-lg font-bold uppercase tracking-widest hover:bg-[#A93226] transition-all">
               Înapoi la Dashboard
             </button>
          </div>
        </div>
      </main>
    );
  }

  const intrebareCurenta = INTREBARI[indexCurent];

  return (
    <main className="min-h-screen bg-[#0F0D0D] text-[#e8e1e0] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(192,57,43,0.08)_0%,rgba(15,13,13,0)_70%)] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0D0D] border-b border-[#2E2724] h-[52px] flex justify-between items-center px-6">
        <span className="text-xl font-black text-[#F0EAE8] tracking-tighter flex items-center gap-1">
          FPLAYT <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full" />
        </span>
      </nav>

      <div className="flex-grow flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C0392B]" />
          
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#2E2724]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Timp Rămas</p>
                <div className={`text-lg font-black tabular-nums ${timpRamas < 60 ? 'text-[#C0392B] animate-pulse' : 'text-[#F0EAE8]'}`}>
                  {formatTimp(timpRamas)}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Erori</p>
                <div className="text-lg font-black text-[#C0392B]">{greseli}/3</div>
              </div>
            </div>

            <header className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0392B]">EXAMINARE RADIO · #{indexCurent + 1}</p>
              <h2 className="text-xl font-bold text-[#F0EAE8] leading-tight">{intrebareCurenta?.intrebare}</h2>
            </header>

            <section className="space-y-3">
              {intrebareCurenta?.optiuni.map((optiune, i) => {
                const isActive = optiuneSelectata === optiune;
                return (
                  <button
                    key={i}
                    disabled={!!feedback}
                    onClick={() => setOptiuneSelectata(optiune)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group
                      ${isActive 
                        ? 'bg-[#C0392B] border-[#C0392B] shadow-lg shadow-[#C0392B]/10' 
                        : 'bg-[#231E1C] border-[#2E2724] hover:border-[#C0392B]/50'
                      }`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors
                      ${isActive ? 'bg-[#F0EAE8]/20 text-[#F0EAE8]' : 'bg-[#1A1614] border border-[#2E2724] text-[#8A7E7C]'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[13px] font-medium text-[#F0EAE8]">{optiune}</span>
                  </button>
                );
              })}
            </section>

            <div className="space-y-4 pt-4">
              <div className="w-full bg-[#231E1C] h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-[#C0392B] h-full transition-all duration-500" 
                  style={{ width: `${((indexCurent + 1) / INTREBARI.length) * 100}%` }}
                />
              </div>
              <button
                onClick={handleConfirm}
                disabled={!optiuneSelectata || !!feedback}
                className="w-full py-4 bg-[#C0392B] disabled:opacity-30 text-[#F0EAE8] rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#A93226] transition-all active:scale-95"
              >
                {feedback ? 'Procesare...' : 'Confirmă Răspunsul'}
              </button>
            </div>
          </div>
          
          <footer className="border-t border-[#2E2724] py-3 bg-[#141110]">
            <p className="text-[9px] text-center text-[#8A7E7C]/40 font-medium uppercase tracking-widest">
              Sistem Securizat FPLAYT · Întrebarea {indexCurent + 1} / {INTREBARI.length}
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default function TestRadio() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0D0D]" />}>
      <TestRadioContent />
    </Suspense>
  );
}
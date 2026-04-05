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

  const [intrebariSuflate, setIntrebariSuflate] = useState([]);
  const [isReady, setIsReady] = useState(false);
  
  const [indexCurent, setIndexCurent] = useState(0);
  const [optiuneSelectata, setOptiuneSelectata] = useState(null);
  const [greseli, setGreseli] = useState(0);
  const [timpRamas, setTimpRamas] = useState(TIMP_TOTAL);
  const [stare, setStare] = useState('activ');
  const [motivFinal, setMotivFinal] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const timpRamasRef = useRef(TIMP_TOTAL);
  const greseliRef = useRef(0);
  const stareRef = useRef('activ');
  const intrebariGresiteRef = useRef([]);
  const motivRef = useRef('');

  // SHUFFLE LOGIC - Rulează doar pe Client
  useEffect(() => {
    const shuffleArray = (array) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const intrebariNoi = shuffleArray(INTREBARI).map(q => ({
      ...q,
      optiuni: shuffleArray(q.optiuni)
    }));

    setIntrebariSuflate(intrebariNoi);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stareRef.current === 'activ') {
        terminaTest('anticheat');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (stare !== 'activ' || !isReady) return;
    const interval = setInterval(() => {
      timpRamasRef.current -= 1;
      setTimpRamas(timpRamasRef.current);
      if (timpRamasRef.current <= 0) {
        clearInterval(interval);
        terminaTest('timp_expirat');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stare, isReady]);

  const terminaTest = useCallback((motiv) => {
    if (stareRef.current !== 'activ') return;
    const admis = greseliRef.current <= MAX_GRESELI && motiv === 'finalizat';
    motivRef.current = motiv;
    stareRef.current = admis ? 'promovat' : 'picat';
    setMotivFinal(motiv);
    setStare(admis ? 'promovat' : 'picat');
  }, []);

  const handleConfirm = () => {
    if (optiuneSelectata === null || feedback) return;

    const intrebareCurenta = intrebariSuflate[indexCurent];
    const esteGresit = optiuneSelectata !== intrebareCurenta.raspunsCorect;

    if (esteGresit) {
      setFeedback('gresit');
      intrebariGresiteRef.current.push({
        intrebare: intrebareCurenta.intrebare,
        raspunsdat: optiuneSelectata,
        raspunsCorect: intrebareCurenta.raspunsCorect,
      });
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
      if (indexCurent + 1 >= intrebariSuflate.length) {
        terminaTest('finalizat');
      } else {
        setIndexCurent((prev) => prev + 1);
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

  const formatTimp = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Prevenim eroarea de Hydration afișând un loader până când întrebările sunt amestecate
  if (!isReady) {
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
            <p className="text-[#8A7E7C] text-sm">
              {admis ? 'Felicitări!' : (motivFinal === 'anticheat' ? 'Ai părăsit pagina.' : 'Prea multe greșeli.')}
            </p>
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

  const intrebareCurenta = intrebariSuflate[indexCurent];

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
              <p className="text-[10px] font-bold text-[#C0392B] uppercase">Întrebarea {indexCurent + 1} / {intrebariSuflate.length}</p>
              <h2 className="text-xl font-bold text-[#F0EAE8] mt-2">{intrebareCurenta?.intrebare}</h2>
           </header>
           <section className="space-y-3">
              {intrebareCurenta?.optiuni.map((optiune, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => setOptiuneSelectata(optiune)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${optiuneSelectata === optiune ? 'bg-[#C0392B] border-[#C0392B]' : 'bg-[#231E1C] border-[#2E2724]'}`}
                >
                  <span className="text-sm">{optiune}</span>
                </button>
              ))}
           </section>
           <button
             onClick={handleConfirm}
             disabled={!optiuneSelectata || !!feedback}
             className="w-full py-4 bg-[#C0392B] disabled:opacity-30 text-white rounded-lg font-bold uppercase"
           >
             {feedback ? 'Procesare...' : 'Confirmă'}
           </button>
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
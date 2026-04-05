'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const INTREBARI = [
  {
    id: 1,
    intrebare: 'Când se folosește foarfeca hidraulică?',
    optiuni: [
      'Foarfeca hidraulică se folosește la taierea unor părți ale caroseriei autovehiculelor (stâlpi, volan, plafon).',
      'Se folosește pentru a deschide uși blocate sau deformate.',
      'Se folosește pentru legarea unor părți ale caroseriei de un punct fix.',
      'Se folosește la tăierea parbrizului sau a lunetei.',
    ],
    raspunsCorect: 'Foarfeca hidraulică se folosește la taierea unor părți ale caroseriei autovehiculelor (stâlpi, volan, plafon).',
  },
  {
    id: 2,
    intrebare: 'Care e primul pas al procesului de descarcerare propriu-zise?',
    optiuni: [
      'Montarea gulerului cervical.',
      'Stabilizarea vehiculului.',
      'Deconectarea bateriei.',
      'Stabilirea unui plan de acțiune.',
    ],
    raspunsCorect: 'Stabilizarea vehiculului.',
  },
  {
    id: 3,
    intrebare: 'Când se folosește gheara mecanică?',
    optiuni: [
      'Când este necesară tăierea stâlpilor caroseriei.',
      'Când trebuie deschisă o ușă blocată.',
      'Atunci când este necesară legarea unei părți a caroseriei de un punct fix pentru a o desprinde.',
      'Când se taie parbrizul sau luneta.',
    ],
    raspunsCorect: 'Atunci când este necesară legarea unei părți a caroseriei de un punct fix pentru a o desprinde.',
  },
  {
    id: 4,
    intrebare: 'Cum prevenim riscul de incendiu la procesul de descarcerare?',
    optiuni: [
      'Utilizăm extinctorul înainte de a începe operațiunea.',
      'Montăm triunghiurile de blocare sub roți.',
      'Deconectăm bateria decuplând cablurile sau tăindu-le.',
      'Aplicăm folie pentru arsuri pe caroserie.',
    ],
    raspunsCorect: 'Deconectăm bateria decuplând cablurile sau tăindu-le.',
  },
  {
    id: 5,
    intrebare: 'Ce echipamente trebuie să utilizăm înainte de a extrage victima din mașină?',
    optiuni: [
      'Masca de oxigen și adrenalina.',
      'Fierăstrăul pneumatic și compresorul.',
      'Guler Cervical și KED de extracție.',
      'Cleștele hidraulic și gheara mecanică.',
    ],
    raspunsCorect: 'Guler Cervical și KED de extracție.',
  },
  {
    id: 6,
    intrebare: 'Care echipament hidraulic este utilizat pentru a deschide o ușă blocată sau deformată în urma unui accident?',
    optiuni: [
      'Foarfeca hidraulică.',
      'Gheara mecanică.',
      'Fierăstrăul pneumatic.',
      'Cleștele hidraulic.',
    ],
    raspunsCorect: 'Cleștele hidraulic.',
  },
  {
    id: 7,
    intrebare: 'Ce este esențial pentru echipa de descarcerare înainte de a începe operațiunea?',
    optiuni: [
      'Să deconecteze bateria vehiculului.',
      'Să stabilească un plan clar de acțiune pentru extragere.',
      'Să monteze gulerul cervical victimei.',
      'Să verifice starea de conștiență a victimei.',
    ],
    raspunsCorect: 'Să stabilească un plan clar de acțiune pentru extragere.',
  },
  {
    id: 8,
    intrebare: 'Ce trebuie să faci dacă pacientul prezintă dificultăți de respirație în timpul descarcerării?',
    optiuni: [
      'Administrează adrenalină intravenos.',
      'Aplică dermazin și folie pentru arsuri.',
      'Să îi oferi oxigen printr-o mască de oxigen.',
      'Montează KED de extracție imediat.',
    ],
    raspunsCorect: 'Să îi oferi oxigen printr-o mască de oxigen.',
  },
  {
    id: 9,
    intrebare: 'Ce medicament este utilizat pentru prevenirea șocului anafilactic în cazul reacțiilor alergice severe în timpul intervenției?',
    optiuni: [
      'Morfină injectabilă.',
      'Hidrocortizon injectabil sau adrenalină.',
      'Nurofen răceală și gripă.',
      'Dermazin crema.',
    ],
    raspunsCorect: 'Hidrocortizon injectabil sau adrenalină.',
  },
  {
    id: 10,
    intrebare: 'Pentru ce tip de situație este utilizată adrenalina în contextul descarcerării?',
    optiuni: [
      'Reacții alergice severe.',
      'Arsuri de gradul 1.',
      'Stop Cardiorespirator.',
      'Dificultăți de respirație.',
    ],
    raspunsCorect: 'Stop Cardiorespirator.',
  },
  {
    id: 11,
    intrebare: 'Ce echipament utilizăm pentru a stabiliza capul victimei?',
    optiuni: [
      'KED de extracție.',
      'Guler Cervical.',
      'Triunghiuri de blocare.',
      'Masca de oxigen.',
    ],
    raspunsCorect: 'Guler Cervical.',
  },
  {
    id: 12,
    intrebare: 'Care este primul parametru vital verificat la o victimă?',
    optiuni: [
      'Respirația.',
      'Pulsul.',
      'Starea de conștiență.',
      'Tensiunea arterială.',
    ],
    raspunsCorect: 'Starea de conștiență.',
  },
  {
    id: 13,
    intrebare: 'Care este scopul principal al triunghiurilor de blocare și unde se amplasează?',
    optiuni: [
      'Se pun la intrarea în zona de intervenție pentru semnalizare.',
      'Se pun sub roți pentru imobilizarea vehiculului.',
      'Se pun pe caroserie pentru protecție.',
      'Se pun lângă baterie pentru siguranță.',
    ],
    raspunsCorect: 'Se pun sub roți pentru imobilizarea vehiculului.',
  },
  {
    id: 14,
    intrebare: 'Cum acționați dacă, odată ajuns la apel, victima prezintă arsuri pe corp din pricina unui incendiu?',
    optiuni: [
      'Administrează morfină intravenos și monitorizează.',
      'Aplică Dermazin (cremă) sau Regen Agen (cremă) și folie pentru arsuri.',
      'Oferă oxigen printr-o mască și hidrocortizon.',
      'Montează gulerul cervical și KED de extracție.',
    ],
    raspunsCorect: 'Aplică Dermazin (cremă) sau Regen Agen (cremă) și folie pentru arsuri.',
  },
  {
    id: 15,
    intrebare: 'Când se folosește fierăstrăul pneumatic și de ce alt echipament este acționat?',
    optiuni: [
      'Se folosește la tăierea stâlpilor și este acționat de cleștele hidraulic.',
      'Se folosește la tăierea ușilor și este acționat de gheara mecanică.',
      'Se folosește la tăierea parbrizului sau a lunetei și este acționat de către compresorul din autospecială.',
      'Se folosește la deconectarea bateriei și este acționat manual.',
    ],
    raspunsCorect: 'Se folosește la tăierea parbrizului sau a lunetei și este acționat de către compresorul din autospecială.',
  },
];

const TIMP_TOTAL = 180;
const MAX_GRESELI = 2;

function TestSMULSContent() {
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

export default function TestSMULS() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0D0D]" />}>
      <TestSMULSContent />
    </Suspense>
  );
}
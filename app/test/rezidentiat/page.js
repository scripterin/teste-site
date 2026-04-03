'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const INTREBARI = [
  {
    id: 1,
    intrebare: 'Înainte de operația de chirurgie plastică, ce este obligat pacientul să facă?',
    optiuni: [
      'Să facă o radiografie',
      'Să primească antibiotic',
      'Să semneze acordul pentru intervenție'
    ],
    raspunsCorect: 'Să semneze acordul pentru intervenție'
  },
  {
    id: 2,
    intrebare: 'Care este taxa stabilită pentru operația de chirurgie plastică?',
    optiuni: [
      '500.000$',
      '10.000$',
      '550.000$'
    ],
    raspunsCorect: '550.000$'
  },
  {
    id: 3,
    intrebare: 'În chirurgia plastică nazală, ce structură este remodelată?',
    optiuni: [
      'Mușchiul facial',
      'Structurile nazale (cartilaj/os)',
      'Plămânul'
    ],
    raspunsCorect: 'Structurile nazale (cartilaj/os)'
  },
  {
    id: 4,
    intrebare: 'Prin ce metodă se realizează scoaterea tatuajelor?',
    optiuni: [
      'Incizie',
      'Injecție',
      'Laser'
    ],
    raspunsCorect: 'Laser'
  },
  {
    id: 5,
    intrebare: 'De ce factor depinde numărul de impulsuri laser la scoaterea unui tatuaj?',
    optiuni: [
      'Dimensiunea tatuajului',
      'Pulsul pacientului',
      'Vârsta pacientului'
    ],
    raspunsCorect: 'Dimensiunea tatuajului'
  },
  {
    id: 6,
    intrebare: 'Ce trebuie să evite pacientul după procedura de scoatere a tatuajelor?',
    optiuni: [
      'Să maseze zona',
      'Să evite scărpinarea zonei',
      'Să îndepărteze crustele'
    ],
    raspunsCorect: 'Să evite scărpinarea zonei'
  },
  {
    id: 7,
    intrebare: 'Ce investigație este obligatorie înainte de operația pentru fractură?',
    optiuni: [
      'EKG',
      'Spirometrie',
      'Radiografie'
    ],
    raspunsCorect: 'Radiografie'
  },
  {
    id: 8,
    intrebare: 'Ce tip de anestezie se utilizează în operația de fractură?',
    optiuni: [
      'Propofol',
      'Xilină',
      'Tetracaină'
    ],
    raspunsCorect: 'Propofol'
  },
  {
    id: 9,
    intrebare: 'Cum se realizează stabilizarea unei fracturi în timpul intervenției?',
    optiuni: [
      'Bandaj',
      'Tijă metalică',
      'Laser'
    ],
    raspunsCorect: 'Tijă metalică'
  },
  {
    id: 10,
    intrebare: 'Ce instrumente se folosesc după incizie în operația de fractură?',
    optiuni: [
      'Defibrilator',
      'Atelă',
      'Depărtătoare'
    ],
    raspunsCorect: 'Depărtătoare'
  },
  {
    id: 11,
    intrebare: 'Care este simptomul principal în cazul unei apendicite?',
    optiuni: [
      'Durere în cadranul inferior drept',
      'Durere toracică',
      'Cefalee'
    ],
    raspunsCorect: 'Durere în cadranul inferior drept'
  },
  {
    id: 12,
    intrebare: 'Ce tip de anestezie se aplică pentru operația de apendicită?',
    optiuni: [
      'Rahianestezie',
      'Generală',
      'Locală'
    ],
    raspunsCorect: 'Generală'
  },
  {
    id: 13,
    intrebare: 'Cu ce instrument este îndepărtat apendicele?',
    optiuni: [
      'Foarfecă',
      'Laser',
      'Atelă'
    ],
    raspunsCorect: 'Foarfecă'
  },
  {
    id: 14,
    intrebare: 'Ce se utilizează pentru fixare în operația de coastă ruptă?',
    optiuni: [
      'Bandaj simplu',
      'Tijă',
      'Plăcuță metalică'
    ],
    raspunsCorect: 'Plăcuță metalică'
  },
  {
    id: 15,
    intrebare: 'Care este simptomul principal raportat în cazul unei coaste rupte?',
    optiuni: [
      'Durere toracică',
      'Febră',
      'Tuse'
    ],
    raspunsCorect: 'Durere toracică'
  },
  {
    id: 16,
    intrebare: 'În cazul unei plăgi împușcate, care este primul gest medical?',
    optiuni: [
      'Incizie',
      'Stază pe rană',
      'Antibiotic'
    ],
    raspunsCorect: 'Stază pe rană'
  },
  {
    id: 17,
    intrebare: 'Ce anestezic se folosește la scoaterea glonțului?',
    optiuni: [
      'Propofol',
      'Tetracaină',
      'Xilină'
    ],
    raspunsCorect: 'Xilină'
  },
  {
    id: 18,
    intrebare: 'Cu ce instrument se extrage glonțul din corp?',
    optiuni: [
      'Pensă',
      'Foarfecă',
      'Seringă'
    ],
    raspunsCorect: 'Pensă'
  },
  {
    id: 19,
    intrebare: 'Care este poziția pacientului în operația de hernie de disc?',
    optiuni: [
      'Pe spate',
      'În șezut',
      'Pe burtă'
    ],
    raspunsCorect: 'Pe burtă'
  },
  {
    id: 20,
    intrebare: 'Ce se îndepărtează efectiv în operația de hernie de disc?',
    optiuni: [
      'Os',
      'Fragment de disc herniat',
      'Mușchi'
    ],
    raspunsCorect: 'Fragment de disc herniat'
  },
  {
    id: 21,
    intrebare: 'Prin ce metodă se face intervenția în ruptura de menisc?',
    optiuni: [
      'Endoscopie',
      'Incizie mare',
      'Radiografie'
    ],
    raspunsCorect: 'Endoscopie'
  },
  {
    id: 22,
    intrebare: 'Care este rolul principal al meniscului?',
    optiuni: [
      'Digestie',
      'Stabilizare articulație',
      'Respirație'
    ],
    raspunsCorect: 'Stabilizare articulație'
  },
  {
    id: 23,
    intrebare: 'Ce echipament video se utilizează în operația de menisc?',
    optiuni: [
      'Defibrilator',
      'Laser extern',
      'Cameră video'
    ],
    raspunsCorect: 'Cameră video'
  },
  {
    id: 24,
    intrebare: 'Ce se face imediat după montarea tijei în operația de fractură?',
    optiuni: [
      'Defibrilare',
      'Dezinfectare și sutură',
      'Transport direct'
    ],
    raspunsCorect: 'Dezinfectare și sutură'
  },
  {
    id: 25,
    intrebare: 'Unde este dus pacientul după operația de apendicită?',
    optiuni: [
      'Externat imediat',
      'Trimis acasă',
      'În salon pentru recuperare'
    ],
    raspunsCorect: 'În salon pentru recuperare'
  }
];

const TIMP_TOTAL = 360;
const MAX_GRESELI = 2;

function TestSMULSContent() {
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

  const terminaTest = useCallback((motiv) => {
    if (stareRef.current !== 'activ') return;
    const admis = greseliRef.current <= MAX_GRESELI && motiv === 'finalizat';
    stareRef.current = admis ? 'promovat' : 'picat';
    motivFinalRef.current = motiv;

    if (!submitFiredRef.current) {
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
    }

    setMotivFinal(motiv);
    setStare(admis ? 'promovat' : 'picat');
  }, [cod]);

  const handleConfirm = () => {
    if (optiuneSelectata === null) return;

    const intrebareCurenta = INTREBARI[indexCurent];
    const esteGresit = optiuneSelectata !== intrebareCurenta.raspunsCorect;

    if (esteGresit) {
      setFeedback('gresit');
      const nouaGreseala = {
        intrebare: intrebareCurenta.intrebare,
        raspunsdat: optiuneSelectata,
        raspunsCorect: intrebareCurenta.raspunsCorect,
      };
      const nouIntrebariGresite = [...intrebariGresiteRef.current, nouaGreseala];
      intrebariGresiteRef.current = nouIntrebariGresite;
      setIntrebariGresite(nouIntrebariGresite);

      const noileGreseli = greseliRef.current + 1;
      greseliRef.current = noileGreseli;
      setGreseli(noileGreseli);

      if (noileGreseli > MAX_GRESELI) {
        setTimeout(() => terminaTest('greseli_maxime'), 800);
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
    }, 800);
  };

  const formatTimp = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const motivText = {
    anticheat: '⚠️ Ai schimbat tab-ul în timpul testului.',
    timp_expirat: '⏱️ Timpul a expirat.',
    greseli_maxime: '❌ Ai atins numărul maxim de greșeli.',
    finalizat: '',
  };

  if (stare === 'picat' || stare === 'promovat') {
    const admis = stare === 'promovat';
    return (
      <div className="min-h-screen bg-[#020817] bg-grid scanlines flex items-center justify-center p-4">
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#00B4D8] opacity-[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E63946] opacity-[0.04] rounded-full blur-[150px] pointer-events-none" />

        <div
          className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-lg w-full border ${admis ? 'border-[#00B4D8]/40' : 'border-[#E63946]/40'}`}
          style={{ boxShadow: admis ? '0 0 40px rgba(0,180,216,0.1)' : '0 0 40px rgba(230,57,70,0.1)' }}
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{admis ? '✅' : '❌'}</div>
            <h1 className={`font-display text-4xl tracking-wider ${admis ? 'text-[#00B4D8] text-glow' : 'text-[#E63946] text-glow-red'}`}>
              {admis ? 'ADMIS' : 'RESPINS'}
            </h1>
            {motivFinal && motivText[motivFinal] && (
              <p className="text-white/40 mt-2 text-sm font-body">{motivText[motivFinal]}</p>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/40 font-body text-sm">Test</span>
              <span className="text-white font-body text-sm font-semibold">TEST TEORETIC: SMULS</span>
            </div>
            <div className="flex justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/40 font-body text-sm">Greșeli</span>
              <span className={`font-body text-sm font-semibold ${greseli >= 3 ? 'text-[#E63946]' : 'text-yellow-400'}`}>
                {greseli} / 3
              </span>
            </div>
            <div className="flex justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-white/40 font-body text-sm">Timp rămas</span>
              <span className="text-white font-body text-sm font-semibold">{formatTimp(timpRamas)}</span>
            </div>
          </div>

          {submitting && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/30 text-xs font-body">Se trimite rezultatul...</p>
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-glow w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-body font-semibold py-3 rounded-xl transition-all duration-300"
          >
            ← Înapoi la Dashboard
          </button>
        </div>
      </div>
    );
  }

  const intrebareCurenta = INTREBARI[indexCurent];
  const procentTimp = (timpRamas / TIMP_TOTAL) * 100;
  const culoareTimer = timpRamas > 60 ? '#00B4D8' : timpRamas > 30 ? '#F77F00' : '#E63946';

  return (
    <div className="min-h-screen bg-[#020817] bg-grid scanlines flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#00B4D8] opacity-[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E63946] opacity-[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-2xl w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-white tracking-wider text-lg">TEST TEORETIC: SMULS</h1>
            <p className="text-white/30 font-body text-xs mt-0.5">
              Întrebarea <span className="text-[#00B4D8]">{indexCurent + 1}</span> din {INTREBARI.length}
            </p>
          </div>
          <div className="text-right">
            <div className={`font-display text-3xl tracking-widest ${timpRamas <= 30 ? 'text-[#E63946] text-glow-red animate-pulse' : 'text-white'}`}>
              {formatTimp(timpRamas)}
            </div>
            <div className="text-white/30 font-body text-xs mt-0.5">
              Greșeli:{' '}
              <span className={greseli >= 3 ? 'text-[#E63946]' : 'text-yellow-400'}>
                {greseli}/3
              </span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
          <div
            className="h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${procentTimp}%`, backgroundColor: culoareTimer, boxShadow: `0 0 8px ${culoareTimer}` }}
          />
        </div>

        {/* Întrebare */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
          <p className="text-white font-body text-base leading-relaxed">{intrebareCurenta.intrebare}</p>
        </div>

        {/* Opțiuni */}
        <div className="space-y-3 mb-5">
          {intrebareCurenta.optiuni.map((optiune, i) => {
            const esteSelectata = optiuneSelectata === optiune;

            let borderClass = 'border-white/10 hover:border-white/30';
            let bgClass = 'bg-white/5 hover:bg-white/8';

            if (!feedback && esteSelectata) {
              borderClass = 'border-[#00B4D8]/60';
              bgClass = 'bg-[#00B4D8]/10';
            }

            return (
              <button
                key={i}
                onClick={() => !feedback && setOptiuneSelectata(optiune)}
                disabled={!!feedback}
                className={`w-full text-left px-4 py-3 rounded-xl border font-body text-sm text-white transition-all duration-200 ${borderClass} ${bgClass} disabled:cursor-default`}
              >
                <span className="text-white/30 mr-3 font-display">{String.fromCharCode(65 + i)}.</span>
                {optiune}
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={optiuneSelectata === null || !!feedback}
          className="w-full bg-[#00B4D8] hover:bg-[#0096b5] disabled:opacity-30 disabled:cursor-not-allowed text-white font-body font-bold py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]"
        >
          Confirmă răspunsul →
        </button>

        {/* Greșeli dots */}
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: MAX_GRESELI + 1 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < greseli ? 'bg-[#E63946] shadow-[0_0_6px_#E63946]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TestSMULS() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TestSMULSContent />
    </Suspense>
  );
}
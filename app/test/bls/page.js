'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const INTREBARI = [
  {
    id: 1,
    intrebare: 'La fața locului găsești un pacient inconștient dar care respiră. Care este conduita corectă?',
    optiuni: [
      'Începi masajul cardiac imediat',
      'Îl pui în poziția laterală de siguranță',
      'Îi administrezi adrenalină 1 ml',
      'Îl urci direct pe targă fără evaluare'
    ],
    raspunsCorect: 'Îl pui în poziția laterală de siguranță'
  },
  {
    id: 2,
    intrebare: 'În evaluarea inițială a pacientului, metoda P.A.S înseamnă:',
    optiuni: [
      'Privește, Ascultă, Simte',
      'Puls, Aer, Saturație',
      'Palpează, Ascultă, Susține',
      'Presiune, Aer, Sistem'
    ],
    raspunsCorect: 'Privește, Ascultă, Simte'
  },
  {
    id: 3,
    intrebare: 'La un pacient cu luxație de gleznă, care este primul gest corect după examinare?',
    optiuni: [
      'Administrare de antibiotice',
      'Efectuarea manevrei de defibrilare',
      'Aplicarea unei atele pentru imobilizare',
      'Administrare de morfină intravenos'
    ],
    raspunsCorect: 'Aplicarea unei atele pentru imobilizare'
  },
  {
    id: 4,
    intrebare: 'Într-un accident rutier cu pacient stabil, ce măsură este esențială înainte de transport?',
    optiuni: [
      'Administrare de adrenalină',
      'Începerea resuscitării cardio-pulmonare',
      'Administrare de hidrocortizon 500 mg',
      'Aplicarea gulerului cervical'
    ],
    raspunsCorect: 'Aplicarea gulerului cervical'
  },
  {
    id: 5,
    intrebare: 'La un pacient în stop cardio-respirator, protocolul corect de resuscitare este:',
    optiuni: [
      '15 compresii toracice + 1 ventilație',
      '30 compresii toracice + 2 ventilații',
      '10 compresii toracice + 5 ventilații',
      'Doar ventilații, fără masaj cardiac'
    ],
    raspunsCorect: '30 compresii toracice + 2 ventilații'
  },
  {
    id: 6,
    intrebare: 'La un pacient implicat într-un accident rutier, observi răni deschise cu sângerare. Care este conduita corectă?',
    optiuni: [
      'Cureți, dezinfectezi și pansezi rana',
      'Aplici direct o atelă ghipsată',
      'Administrezi morfină pentru durere',
      'Îl urci pe targă fără să atingi rănile'
    ],
    raspunsCorect: 'Cureți, dezinfectezi și pansezi rana'
  },
  {
    id: 7,
    intrebare: 'În cazul arsurilor, tratamentul corect inițial este:',
    optiuni: [
      'Administrare de morfină și monitorizare',
      'Defibrilare și masaj cardiac',
      'Aplicare de Dermazin și folie pentru arsuri',
      'Administrare de antibiotice imediat'
    ],
    raspunsCorect: 'Aplicare de Dermazin și folie pentru arsuri'
  },
  {
    id: 8,
    intrebare: 'Pacient cu căi respiratorii blocate și fără puls. Care este primul pas?',
    optiuni: [
      'Administrare de adrenalină',
      'Eliberarea căilor respiratorii și RCP',
      'Poziție laterală de siguranță',
      'Curățarea zonei cu betadină'
    ],
    raspunsCorect: 'Eliberarea căilor respiratorii și RCP'
  },
  {
    id: 9,
    intrebare: 'În șoc anafilactic, tratamentul corect de primă linie este:',
    optiuni: [
      'Administrare de Morfină',
      'Administrare de Adrenalină / Hidrocortizon',
      'Administrare de Antibiotic',
      'Administrare de Voltaren sau Paracetamol'
    ],
    raspunsCorect: 'Administrare de Adrenalină / Hidrocortizon'
  },
  {
    id: 10,
    intrebare: 'La dureri insuportabile post-traumatice, ce medicație este indicată?',
    optiuni: [
      'Administrare de Morfină intravenos',
      'Administrare de Vitamina C',
      'Administrare de Paracetamol simplu',
      'Administrare de Strepsils'
    ],
    raspunsCorect: 'Administrare de Morfină intravenos'
  },
  {
    id: 11,
    intrebare: 'În cazul unui pacient înecat aflat în stop cardio-respirator, ce trebuie să observi în timpul resuscitării?',
    optiuni: [
      'Creșterea tensiunii arteriale',
      'Scăderea bruscă a temperaturii',
      'Eliminarea apei din căile respiratorii',
      'Apariția reflexului de durere'
    ],
    raspunsCorect: 'Eliminarea apei din căile respiratorii'
  },
  {
    id: 12,
    intrebare: 'Naloxona este utilizată în:',
    optiuni: [
      'Șoc anafilactic sever',
      'Intoxicații cu opioide (substanțe interzise)',
      'Arsuri de gradul III',
      'Fracturi deschise de membru'
    ],
    raspunsCorect: 'Intoxicații cu substanțe interzise'
  }
];

const TIMP_TOTAL = 180;
const MAX_GRESELI = 2;

// ─── Componenta internă care folosește useSearchParams ───────────────────────
function TestBLSContent() {
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
  const [submitDone, setSubmitDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const timpRamasRef = useRef(TIMP_TOTAL);
  const greseliRef = useRef(0);
  const stareRef = useRef('activ');
  const intrebariGresiteRef = useRef([]);

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
    setMotivFinal(motiv);
    setStare(admis ? 'promovat' : 'picat');
  }, []);

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

  useEffect(() => {
    if ((stare === 'picat' || stare === 'promovat') && !submitDone) {
      setSubmitDone(true);
      setSubmitting(true);
      const motiv = stare === 'promovat' ? 'finalizat' : motivFinal;
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
  }, [stare]);

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
              <span className="text-white font-body text-sm font-semibold">TEST TEORETIC: BLS</span>
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-white tracking-wider text-lg">TEST TEORETIC: BLS</h1>
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

        <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
          <div
            className="h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${procentTimp}%`, backgroundColor: culoareTimer, boxShadow: `0 0 8px ${culoareTimer}` }}
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
          <p className="text-white font-body text-base leading-relaxed">{intrebareCurenta.intrebare}</p>
        </div>

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

        <button
          onClick={handleConfirm}
          disabled={optiuneSelectata === null || !!feedback}
          className="w-full bg-[#00B4D8] hover:bg-[#0096b5] disabled:opacity-30 disabled:cursor-not-allowed text-white font-body font-bold py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]"
        >
          Confirmă răspunsul →
        </button>

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

// ─── Export default — învelește totul în Suspense ────────────────────────────
export default function TestBLS() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TestBLSContent />
    </Suspense>
  );
}
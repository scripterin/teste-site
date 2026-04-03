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
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const timpRamasRef = useRef(TIMP_TOTAL);
  const greseliRef = useRef(0);
  const stareRef = useRef('activ');
  const intrebariGresiteRef = useRef([]);

  // --- Logică Anticheat (Păstrată din fișierul tău) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stareRef.current === 'activ') {
        terminaTest('anticheat');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // --- Logică Timer ---
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
    if (optiuneSelectata === null || feedback) return;

    const intrebareCurenta = INTREBARI[indexCurent];
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
      if (indexCurent + 1 >= INTREBARI.length) {
        terminaTest('finalizat');
      } else {
        setIndexCurent((prev) => prev + 1);
      }
    }, 600);
  };

  // --- API Submit ---
  useEffect(() => {
    if ((stare === 'picat' || stare === 'promovat') && !submitting) {
      setSubmitting(true);
      fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cod,
          greseli: greseliRef.current,
          timpRamas: timpRamasRef.current,
          intrebariGresite: intrebariGresiteRef.current,
          motiv: stare === 'promovat' ? 'finalizat' : motivFinal,
        }),
      }).catch(console.error);
    }
  }, [stare, cod, motivFinal, submitting]);

  const formatTimp = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- UI: Ecran Final (Admis/Respins) ---
if (stare === 'picat' || stare === 'promovat') {
    const admis = stare === 'promovat';
    return (
      <main className="min-h-screen bg-[#0F0D0D] flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl overflow-hidden relative">
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${admis ? 'bg-green-500' : 'bg-[#C0392B]'}`} />
          <div className="p-8 text-center space-y-6">
             
             {/* ICONITA REPARATA: Fara text "cancel" */}
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

             <button 
               onClick={() => router.push('/dashboard')} 
               className="w-full py-4 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-lg font-bold uppercase tracking-widest transition-all active:scale-95"
             >
               Înapoi la Dashboard
             </button>
          </div>
        </div>
      </main>
    );
  }

  // --- UI: Test Activ ---
  const intrebareCurenta = INTREBARI[indexCurent];

  return (
    <main className="min-h-screen bg-[#0F0D0D] text-[#e8e1e0] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(192,57,43,0.08)_0%,rgba(15,13,13,0)_70%)] pointer-events-none" />
      
      {/* Navbar Minimalist */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0D0D] border-b border-[#2E2724] h-[52px] flex justify-between items-center px-6">
        <span className="text-xl font-black text-[#F0EAE8] tracking-tighter flex items-center gap-1">
          FPLAYT <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full" />
        </span>
        <div className="text-xs font-bold text-[#8A7E7C] uppercase tracking-[0.2em]">
          Examinare Activă
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-[480px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C0392B]" />
          
          <div className="p-8 space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-center pb-4 border-b border-[#2E2724]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Timp Rămas</p>
                <div className={`text-lg font-black tabular-nums ${timpRamas < 60 ? 'text-[#C0392B] animate-pulse' : 'text-[#F0EAE8]'}`}>
                  {formatTimp(timpRamas)}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E7C]">Greșeli</p>
                <div className="text-lg font-black text-[#C0392B] flex items-center justify-end gap-1">
                  {greseli}/3
                </div>
              </div>
            </div>

            {/* Întrebare */}
            <header className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0392B]">
                Întrebarea{indexCurent + 1} DIN {INTREBARI.length}
              </p>
              <h2 className="text-xl font-bold text-[#F0EAE8] leading-tight">
                {intrebareCurenta?.intrebare}
              </h2>
            </header>

            {/* Opțiuni */}
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
                    <span className={`text-[13px] font-medium ${isActive ? 'text-[#F0EAE8]' : 'text-[#F0EAE8]'}`}>
                      {optiune}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* Footer Card */}
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
                className="w-full py-4 bg-[#C0392B] disabled:opacity-30 text-[#F0EAE8] rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#A93226] transition-all"
              >
                {feedback ? 'Se procesează...' : 'Confirmă Răspunsul'}
              </button>
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
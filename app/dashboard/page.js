'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';

const IconShieldCheck = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedTest, setSelectedTest] = useState(null);
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [validatedTest, setValidatedTest] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (code.length === 6) handleValidateCode();
    else { 
      setCodeValid(false); 
      setValidatedTest(null); 
    }
  }, [code]);

  // Funcție pentru notificări stilizate (Design Medical Terminal)
  const notify = (type, text) => {
    const commonStyle = {
      background: 'rgba(11, 17, 32, 0.9)',
      backdropFilter: 'blur(16px)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.25em',
      padding: '18px 24px',
      borderRadius: '2px', // Aspect pătrățos, industrial
      fontFamily: 'monospace',
      minWidth: '350px',
      boxShadow: '0 0 40px rgba(0,0,0,0.8)',
    };

    const themes = {
      success: {
        ...commonStyle,
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderLeft: '4px solid #10b981',
        color: '#10b981',
      },
      error: {
        ...commonStyle,
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderLeft: '4px solid #ef4444',
        color: '#ef4444',
      },
      info: {
        ...commonStyle,
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderLeft: '4px solid #06b6d4',
        color: '#22d3ee',
      }
    };

    const selectedTheme = themes[type] || themes.info;

    toast(text, {
      style: selectedTheme,
      icon: type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ',
    });
  };

  const handleGenerateCode = async () => {
    if (!selectedTest) return notify('error', 'Selectează un test!');
    setLoadingGenerate(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSelectat: selectedTest }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.error || 'Eroare la generare.');
      } else {
        notify('success', 'Cod trimis pe Discord!');
      }
    } catch { 
      notify('error', 'Eroare de conexiune la server.'); 
    } finally { 
      setLoadingGenerate(false); 
    }
  };

  const handleValidateCode = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) return;
    setLoadingValidate(true);
    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeValid(true);
        setValidatedTest(data.testSelectat);
        notify('success', 'Acces Autorizat!');
      } else {
        setCodeValid(false);
        notify('error', 'Cod de acces invalid.');
      }
    } catch { 
      setCodeValid(false); 
    } finally { 
      setLoadingValidate(false); 
    }
  }, [code]);

  const handleStartTest = () => {
    if (!codeValid) return;
    setCountdown(3);
    notify('info', 'Inițializare mediu testare...');
  };

  useEffect(() => {
    if (countdown === 0) {
      const testPath = validatedTest?.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'test';
      router.push(`/test/${testPath}?cod=${code.toUpperCase()}`);
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, router, validatedTest, code]);

  return (
    <div className="h-screen bg-[#030712] text-slate-200 overflow-hidden flex flex-col font-sans">
      {/* Containerul de notificări (Poziționat pentru a nu atinge marginile) */}
      <Toaster 
        position="bottom-right" 
        containerStyle={{
          bottom: 40, // Mai sus de marginea de jos
          right: 40,  // Mai departe de marginea din dreapta
        }}
        toastOptions={{
          duration: 4500,
        }}
      />
      
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full max-w-6xl mx-auto py-4">
        
        <header className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-[10px] font-black mb-6 uppercase tracking-[0.3em] animate-pulse">
            <IconShieldCheck /> Terminal Examinare v2.0
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 italic">
            DEP. MEDICAL <span className="text-cyan-500 not-italic">FPLAYT</span>
          </h1>
          <p className="text-slate-500 text-sm font-light tracking-widest uppercase">
            Selectează testul pe care dorești să îl susții
          </p>
        </header>

        <div className="w-full flex justify-center mb-10">
          <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
        </div>

        <section className="w-full max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-cyan-500/10 blur-xl group-hover:bg-cyan-500/20 transition-all duration-700 opacity-50" />
            
            <div className="relative bg-[#0b1120]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-3xl" />

              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black tracking-[0.4em] text-cyan-500/60 uppercase mb-1">
                    Security Protocol
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                    Autentificare Acces
                  </h3>
                  <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-3" />
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="••••••"
                    className={`w-full bg-transparent border-b-2 rounded-none py-4 text-center font-display text-5xl tracking-[0.4em] text-white outline-none transition-all duration-500 placeholder:text-white/5 ${
                      codeValid 
                        ? 'border-emerald-500 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-full w-full top-0 animate-[scan_3s_linear_infinite] opacity-20" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={handleGenerateCode}
                    disabled={loadingGenerate || !selectedTest}
                    className="group relative overflow-hidden py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all disabled:opacity-20"
                  >
                    <span className="relative z-10 text-[9px] font-black tracking-widest text-slate-400 group-hover:text-white uppercase">
                      {loadingGenerate ? 'Procesare...' : 'Solicită Cod'}
                    </span>
                  </button>

                  <button
                    onClick={handleStartTest}
                    disabled={!codeValid}
                    className={`relative overflow-hidden py-3 rounded-xl font-black text-[9px] tracking-widest transition-all duration-500 uppercase ${
                      codeValid 
                        ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95' 
                        : 'bg-white/5 text-white/10 border border-white/5'
                    }`}
                  >
                    <span className="relative z-10">Start Test</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
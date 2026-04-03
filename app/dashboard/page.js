'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';

const IconShieldCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
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

  const notify = (type, text) => {
    const styles = {
      success: { background: '#fff', color: '#16a34a', border: '1px solid #dcfce7', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
      error:   { background: '#fff', color: '#dc2626', border: '1px solid #fee2e2', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
      info:    { background: '#fff', color: '#2563eb', border: '1px solid #dbeafe', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    };
    toast(text, {
      style: {
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '500',
        padding: '14px 18px',
        ...(styles[type] || styles.info),
      },
      icon: type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ',
    });
  };

  const handleGenerateCode = async () => {
    if (!selectedTest) return notify('error', 'Selectează un test mai întâi.');
    setLoadingGenerate(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSelectat: selectedTest }),
      });
      const data = await res.json();
      if (!res.ok) notify('error', data.error || 'Eroare la generare.');
      else notify('success', 'Cod trimis pe Discord!');
    } catch {
      notify('error', 'Eroare de conexiune.');
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
        notify('success', 'Acces autorizat!');
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
    notify('info', 'Se inițializează testul...');
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
    <div className="min-h-screen bg-[#f8f8f6] text-gray-900 font-sans">
      <Toaster
        position="top-right"
        containerStyle={{ top: 24, right: 24 }}
        toastOptions={{ duration: 4000 }}
      />

      <Navbar />

      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-12">

        {/* Header */}
        <div className="text-center mb-14 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-500 text-[11px] font-medium mb-8 shadow-sm">
            <IconShieldCheck />
            Departament Medical — Examinare
          </div>
          <h1
            className="text-[42px] md:text-[52px] font-bold text-gray-900 leading-none tracking-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Portal de{' '}
            <span
              className="italic font-normal"
              style={{ color: '#1d4ed8' }}
            >
              Examinare
            </span>
          </h1>
          <p className="text-gray-400 text-[15px] leading-relaxed">
            Selectează testul și introdu codul de acces pentru a continua.
          </p>
        </div>

        {/* Step 1 — Select test */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span className="text-[13px] font-semibold text-gray-700 tracking-wide uppercase">Selectează testul</span>
            </div>
            <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
          </div>
        </div>

        {/* Step 2 — Code */}
        <div className="w-full max-w-2xl mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span className="text-[13px] font-semibold text-gray-700 tracking-wide uppercase">Cod de acces</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Code input */}
              <div className="flex-1">
                <label className="block text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-widest">
                  Introdu codul de 6 caractere
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="------"
                    className={`w-full bg-gray-50 border rounded-xl px-5 py-4 text-center font-mono text-3xl tracking-[0.5em] text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-200 ${
                      codeValid
                        ? 'border-green-400 bg-green-50 text-green-700 ring-2 ring-green-100'
                        : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
                    }`}
                  />
                  {codeValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {loadingValidate && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Generate code button */}
              <button
                onClick={handleGenerateCode}
                disabled={loadingGenerate || !selectedTest}
                className="shrink-0 h-[60px] px-6 rounded-xl border border-gray-200 bg-white text-gray-600 text-[13px] font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loadingGenerate ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Procesare...
                  </span>
                ) : 'Solicită cod'}
              </button>
            </div>

            {codeValid && validatedTest && (
              <div className="mt-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-[13px] text-green-700 font-medium">
                  Test autorizat: <strong>{validatedTest}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Start */}
        <div className="w-full max-w-2xl">
          <button
            onClick={handleStartTest}
            disabled={!codeValid || countdown !== null}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 ${
              codeValid && countdown === null
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {countdown !== null ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Se pornește în {countdown}...
              </>
            ) : (
              <>
                Începe testul
                <IconArrowRight />
              </>
            )}
          </button>

          {!codeValid && (
            <p className="text-center text-[12px] text-gray-300 mt-3">
              Introdu un cod valid pentru a activa butonul
            </p>
          )}
        </div>

      </main>
    </div>
  );
}
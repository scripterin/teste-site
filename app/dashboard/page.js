'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ── Notificări stilizate dark/warm-red ──────────────────────────────────────
const notify = (type, text) => {
  const base = {
    background: '#1A1614',
    color: '#F0EAE8',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    padding: '14px 20px',
    borderRadius: '6px',
    fontFamily: 'Inter, sans-serif',
    minWidth: '300px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    border: '1px solid #2E2724',
  };
  const themes = {
    success: { ...base, borderLeft: '3px solid #C0392B', color: '#F0EAE8' },
    error:   { ...base, borderLeft: '3px solid #7C3030', color: '#ffb3b0' },
    info:    { ...base, borderLeft: '3px solid #8A7E7C', color: '#E1BFB9' },
  };
  toast(text, {
    style: themes[type] || themes.info,
    icon: type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ',
  });
};

// ── Butoane test (inline, fără import extern) ────────────────────────────────
const TEST_OPTIONS = ['Operator', 'Staff', 'Management'];

function TestButtons({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TEST_OPTIONS.map((test) => {
        const active = selected === test;
        return (
          <button
            key={test}
            onClick={() => onSelect(test)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              backgroundColor: '#231E1C',
              border: `1px solid ${active ? '#C0392B' : '#2E2724'}`,
              color: active ? '#C0392B' : '#8A7E7C',
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: active ? '#C0392B' : 'rgba(138,126,124,0.3)',
                flexShrink: 0,
              }}
            />
            {test}
          </button>
        );
      })}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedTest, setSelectedTest]     = useState(null);
  const [code, setCode]                     = useState('');
  const [codeValid, setCodeValid]           = useState(false);
  const [validatedTest, setValidatedTest]   = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [countdown, setCountdown]           = useState(null);
  const [inputFocused, setInputFocused]     = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (code.length === 6) handleValidateCode();
    else { setCodeValid(false); setValidatedTest(null); }
  }, [code]);

  const handleGenerateCode = async () => {
    if (!selectedTest) return notify('error', 'Selectează un test!');
    setLoadingGenerate(true);
    try {
      const res  = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSelectat: selectedTest }),
      });
      const data = await res.json();
      if (!res.ok) notify('error', data.error || 'Eroare la generare.');
      else         notify('success', 'Cod trimis pe Discord!');
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
      const res  = await fetch('/api/validate-code', {
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
      const testPath =
        validatedTest
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') || 'test';
      router.push(`/test/${testPath}?cod=${code.toUpperCase()}`);
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, router, validatedTest, code]);

  // Culoarea border-ului input-ului
  const inputBorderColor = codeValid
    ? '#C0392B'
    : inputFocused
    ? '#C0392B'
    : loadingValidate
    ? '#7C3030'
    : '#2E2724';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F0D0D',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Notificări */}
      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 32, right: 32 }}
        toastOptions={{ duration: 4500 }}
      />

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          height: 52,
          backgroundColor: '#0F0D0D',
          borderBottom: '1px solid #2E2724',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#E1BFB9',
              letterSpacing: '-0.02em',
            }}
          >
            FPLAYT
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#C0392B',
            }}
          />
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#8A7E7C' }}>
            {session?.user?.name || 'Utilizator'}
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#2C2929',
              border: '1px solid #2E2724',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#E1BFB9',
              cursor: 'pointer',
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '80px 24px',
        }}
      >
        {/* Glow fundal */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle, rgba(142,19,12,0.08) 0%, rgba(15,13,13,0) 70%)',
          }}
        />

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#1A1614',
            borderRadius: 8,
            border: '1px solid #2E2724',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Linie roșie sus */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 2,
              backgroundColor: '#C0392B',
            }}
          />

          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* ── Header ─────────────────────────────────────────────── */}
            <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#C0392B',
                  margin: 0,
                }}
              >
                DEPARTAMENT MEDICAL · SESIUNE ACTIVĂ
              </p>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#F0EAE8',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Portal Examinare
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: '#8A7E7C',
                  margin: 0,
                  lineHeight: 1.6,
                  maxWidth: 340,
                }}
              >
                Autentifică-te cu codul primit pe Discord pentru a accesa testul alocat.
              </p>
            </header>

            {/* ── Selectare test ─────────────────────────────────────── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#8A7E7C',
                }}
              >
                TEST SELECTAT
              </label>
              <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
            </section>

            {/* ── Cod de acces ───────────────────────────────────────── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#8A7E7C',
                }}
              >
                COD DE ACCES
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="— — — — — —"
                maxLength={6}
                style={{
                  width: '100%',
                  height: 56,
                  backgroundColor: '#231E1C',
                  border: `1px solid ${inputBorderColor}`,
                  borderRadius: 8,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: 20,
                  letterSpacing: '0.5em',
                  color: '#F0EAE8',
                  caretColor: '#C0392B',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: codeValid ? '#C0392B' : '#8A7E7C',
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                {loadingValidate
                  ? 'Se verifică codul...'
                  : codeValid
                  ? '✔ Cod valid — poți accesa testul'
                  : 'Codul expiră în 10 minute'}
              </p>
            </section>

            {/* ── Butoane ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Solicită cod */}
              <button
                onClick={handleGenerateCode}
                disabled={loadingGenerate || !selectedTest}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: '#1A1614',
                  border: '1px solid #C0392B',
                  borderRadius: 8,
                  color: '#C0392B',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  cursor: loadingGenerate || !selectedTest ? 'not-allowed' : 'pointer',
                  opacity: loadingGenerate || !selectedTest ? 0.4 : 1,
                  transition: 'opacity 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loadingGenerate && selectedTest)
                    e.target.style.backgroundColor = 'rgba(192,57,43,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1A1614';
                }}
              >
                {loadingGenerate ? 'Se procesează...' : 'Solicită cod pe Discord'}
              </button>

              {/* Accesează testul */}
              <button
                onClick={handleStartTest}
                disabled={!codeValid || countdown !== null}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: codeValid ? '#C0392B' : '#2E2724',
                  border: 'none',
                  borderRadius: 8,
                  color: codeValid ? '#F0EAE8' : '#8A7E7C',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  cursor: !codeValid || countdown !== null ? 'not-allowed' : 'pointer',
                  opacity: !codeValid && countdown === null ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {countdown !== null
                  ? `Redirecționare în ${countdown}...`
                  : 'Accesează testul →'}
              </button>
            </div>
          </div>

          {/* ── Footer card ──────────────────────────────────────────── */}
          <footer
            style={{
              borderTop: '1px solid #2E2724',
              backgroundColor: '#141110',
              padding: '16px 0',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'rgba(138,126,124,0.4)',
                margin: 0,
                fontWeight: 500,
              }}
            >
              Powered by FPLAYT · Sistem securizat
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
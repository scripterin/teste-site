'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';

const notify = (type, text) => {
  const base = {
    background: '#1A1614',
    color: '#F0EAE8',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    padding: '14px 20px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    minWidth: '320px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    border: '1px solid #2E2724',
  };
  
  const themes = {
    success: { ...base, borderLeft: '4px solid #C0392B', color: '#F0EAE8' },
    error:   { ...base, borderLeft: '4px solid #7C3030', color: '#ffb3b0' },
    info:    { ...base, borderLeft: '4px solid #8A7E7C', color: '#E1BFB9' },
  };

  toast(text, {
    style: themes[type] || themes.info,
    icon: type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ',
  });
};

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
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (code.length === 6) handleValidateCode();
    else { 
      setCodeValid(false); 
      setValidatedTest(null); 
    }
  }, [code]);

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
      if (!res.ok) notify('error', data.error || 'Eroare la generare.');
      else notify('success', 'Cod generat!');
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
        notify('error', 'Cod test invalid.');
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
    notify('info', 'Te trimitem la test...');
  };

  useEffect(() => {
    if (countdown === 0) {
      // ✅ Map explicit — fără conversii de text care pot da erori
      const testMap = {
        'RADIO': 'radio',
        'BLS': 'bls',
        'REZIDENȚIAT': 'rezidentiat',
        'SMULS TEORETIC': 'smuls-teoretic',
      };
      const testPath = testMap[validatedTest] || 'test';
      router.push(`/test/${testPath}?cod=${code.toUpperCase()}`);
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, router, validatedTest, code]);

  const inputBorderColor = codeValid ? '#C0392B' : inputFocused ? '#C0392B' : '#2E2724';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0D0D', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="bottom-right" toastOptions={{ duration: 4500 }} />
      
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(192,57,43,0.05) 0%, rgba(15,13,13,0) 70%)' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: 480, backgroundColor: '#1A1614', border: '1px solid #2E2724', borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          
          <div style={{ height: 2, backgroundColor: '#C0392B', width: '100%' }} />

          <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            <header>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#C0392B', letterSpacing: '0.25em', marginBottom: 8 }}>
                SITE TESTE
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#F0EAE8', letterSpacing: '-0.02em', margin: 0 }}>
                DEP. MEDICAL <span style={{ color: '#C0392B' }}>FPLAYT</span>
              </h1>
              <p style={{ fontSize: 13, color: '#8A7E7C', marginTop: 8, lineHeight: 1.5 }}>
                Selectează testul pe care dorești să îl susții
              </p>
            </header>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8A7E7C', letterSpacing: '0.1em' }}>SELECTEAZĂ TIPUL TESTULUI</label>
              <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8A7E7C', letterSpacing: '0.1em' }}>COD TEST</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="••••••"
                maxLength={6}
                style={{
                  width: '100%', height: 60, backgroundColor: '#231E1C', border: `1px solid ${inputBorderColor}`, borderRadius: 4, textAlign: 'center', fontFamily: 'monospace', fontSize: 24, letterSpacing: '0.4em', color: '#F0EAE8', outline: 'none', transition: 'all 0.2s'
                }}
              />
              {loadingValidate && <p style={{ fontSize: 11, color: '#C0392B', margin: 0, fontStyle: 'italic' }}>Se verifică protocolul...</p>}
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleGenerateCode}
                disabled={loadingGenerate || !selectedTest}
                style={{
                  width: '100%', padding: '16px', backgroundColor: 'transparent', border: '1px solid #C0392B', color: '#C0392B', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: (loadingGenerate || !selectedTest) ? 'not-allowed' : 'pointer', opacity: (loadingGenerate || !selectedTest) ? 0.4 : 1, transition: 'all 0.2s'
                }}
              >
                {loadingGenerate ? 'Generare...' : 'Solicită Cod'}
              </button>

              <button
                onClick={handleStartTest}
                disabled={!codeValid || countdown !== null}
                style={{
                  width: '100%', padding: '16px', backgroundColor: codeValid ? '#C0392B' : '#2E2724', border: 'none', color: codeValid ? '#FFF' : '#8A7E7C', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: (!codeValid || countdown !== null) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                }}
              >
                {countdown !== null ? `Inițializare (${countdown})` : 'Începe Testul'}
              </button>
            </div>

          </div>

          <footer style={{ backgroundColor: '#141110', padding: '12px', borderTop: '1px solid #2E2724', textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: '#4A4240', letterSpacing: '0.1em', margin: 0, fontWeight: 600 }}>ECLIPSE MEDICAL TOWER</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';
import RegulamentScreen from '@/components/RegulamentScreen';

const COOLDOWN_SOLICITA = 30;

const notify = (type, text) => {
  const base = {
    background: 'rgba(20,16,14,0.95)',
    backdropFilter: 'blur(12px)',
    color: '#F0EAE8',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.12em',
    padding: '12px 18px',
    borderRadius: '12px',
    fontFamily: 'monospace',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
  };
  const themes = {
    success: { ...base, borderLeft: '3px solid #C0392B' },
    error:   { ...base, borderLeft: '3px solid #7C3030', color: '#ffb3b0' },
    info:    { ...base, borderLeft: '3px solid rgba(255,255,255,0.2)', color: '#E1BFB9' },
  };
  toast(text, { style: themes[type] || themes.info, icon: null });
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [regulamentAccepted, setRegulamentAccepted] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [validatedTest, setValidatedTest] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  const [cooldownSolicita, setCooldownSolicita] = useState(0);
  const cooldownRef = useRef(null);

  const handleAcceptRegulament = () => setRegulamentAccepted(true);

  useEffect(() => {
    if (cooldownSolicita <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldownSolicita(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldownSolicita > 0]);

  useEffect(() => {
    if (code.length === 6) handleValidateCode();
    else { setCodeValid(false); setValidatedTest(null); }
  }, [code]);

  const handleGenerateCode = async () => {
    if (!selectedTest) return notify('error', 'Selectează un test!');
    if (cooldownSolicita > 0) return;
    setLoadingGenerate(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSelectat: selectedTest }),
      });
      const data = await res.json();
      if (!res.ok) notify('error', data.error || 'Eroare la generare.');
      else {
        notify('success', 'Cod trimis pe Discord');
        setCooldownSolicita(COOLDOWN_SOLICITA);
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
      if (res.ok) { setCodeValid(true); setValidatedTest(data.testSelectat); notify('success', 'Acces Autorizat!'); }
      else { setCodeValid(false); notify('error', 'Cod test invalid.'); }
    } catch { setCodeValid(false); }
    finally { setLoadingValidate(false); }
  }, [code]);

  const handleStartTest = () => {
    if (!codeValid) return;
    setCountdown(3);
    notify('info', 'Te trimitem la test...');
  };

  useEffect(() => {
    if (countdown === 0) {
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

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = cooldownSolicita / COOLDOWN_SOLICITA;
  const dashoffset = circumference * (1 - progress);

  if (!regulamentAccepted) {
    return (
      <>
        <Toaster position="bottom-right" toastOptions={{ duration: 4500 }} />
        <RegulamentScreen onAccept={handleAcceptRegulament} />
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .dash-card { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .btn-solicita {
          width: 100%;
          padding: 15px;
          background: transparent;
          border: 1px solid rgba(192,57,43,0.5);
          border-radius: 12px;
          color: #C0392B;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-solicita:hover:not(:disabled) {
          background: rgba(192,57,43,0.08);
          border-color: #C0392B;
        }
        .btn-solicita:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-start {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-start.active { background: #C0392B; color: #fff; box-shadow: 0 4px 20px rgba(192,57,43,0.35); }
        .btn-start.active:hover { background: #A93226; transform: translateY(-1px); }
        .btn-start.inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.2); cursor: not-allowed; }

        .code-input {
          width: 100%;
          height: 60px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 24px;
          letter-spacing: 0.5em;
          padding-left: 0.5em;
          color: #F0EAE8;
          outline: none;
          transition: all 0.2s;
        }
        .code-input:focus { border-color: rgba(192,57,43,0.6); box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
        .code-input.valid { border-color: #C0392B; color: #C0392B; }
        .code-input::placeholder { color: rgba(255,255,255,0.1); letter-spacing: 0.4em; }

        .dash-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }

        .dash-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
          margin: 4px 0;
        }

        .dash-inner {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .dash-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 46px;
          letter-spacing: 0.04em;
          color: #F0EAE8;
          line-height: 0.95;
          margin: 0;
        }

        /* Cooldown timer */
        .cooldown-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 0 4px;
          animation: fadeUp 0.3s ease both;
        }
        .cooldown-ring { position: relative; width: 72px; height: 72px; }
        .cooldown-ring svg { transform: rotate(-90deg); }
        .cooldown-ring-track { stroke: rgba(192,57,43,0.1); fill: none; }
        .cooldown-ring-fill {
          fill: none;
          stroke: #C0392B;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 6px rgba(192,57,43,0.6));
        }
        .cooldown-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 0.05em;
          color: #C0392B;
        }
        .cooldown-label {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          text-align: center;
        }

        /* RESPONSIVE */
        @media (max-width: 480px) {
          .dash-inner {
            padding: 24px 20px;
            gap: 20px;
          }
          .dash-title {
            font-size: 36px;
          }
          .btn-solicita,
          .btn-start {
            padding: 14px;
            font-size: 10px;
          }
          .code-input {
            height: 56px;
            font-size: 20px;
          }
        }

        @media (max-width: 360px) {
          .dash-inner {
            padding: 20px 16px;
            gap: 16px;
          }
          .dash-title {
            font-size: 30px;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .dash-inner {
            padding: 30px 28px;
            gap: 24px;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toaster
          position="bottom-right"
          toastOptions={{ duration: 4500 }}
          containerStyle={{ bottom: 16, right: 16 }}
        />
        <Navbar />

        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 16px 32px',
        }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: 460 }}>

            <div style={{
              background: 'rgba(18,14,12,0.72)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #C0392B, transparent)' }} />

              <div className="dash-inner">

                <header>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#C0392B', marginBottom: 8, textTransform: 'uppercase' }}>
                    Site teste
                  </p>
                  <h1 className="dash-title">
                    DEP.<br /><span style={{ color: '#C0392B' }}>MEDICAL</span>
                  </h1>
                </header>

                <div className="dash-divider" />

                <div>
                  <span className="dash-label">Tip test</span>
                  <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
                </div>

                <div className="dash-divider" />

                <div>
                  <span className="dash-label">Cod de acces</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="——————"
                    maxLength={6}
                    className={`code-input${codeValid ? ' valid' : ''}`}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  {loadingValidate && (
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#C0392B', marginTop: 8, letterSpacing: '0.15em' }}>
                      verificare...
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="btn-solicita"
                    onClick={handleGenerateCode}
                    disabled={loadingGenerate || !selectedTest || cooldownSolicita > 0}
                  >
                    {loadingGenerate ? 'generare...' : '+ solicită cod'}
                  </button>

                  {cooldownSolicita > 0 && (
                    <div className="cooldown-wrap">
                      <div className="cooldown-ring">
                        <svg width="72" height="72" viewBox="0 0 72 72">
                          <circle className="cooldown-ring-track" cx="36" cy="36" r={radius} strokeWidth="3" />
                          <circle
                            className="cooldown-ring-fill"
                            cx="36" cy="36" r={radius}
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                          />
                        </svg>
                        <div className="cooldown-number">{cooldownSolicita}</div>
                      </div>
                      <p className="cooldown-label">Așteaptă înainte de a solicita din nou</p>
                    </div>
                  )}

                  <button
                    className={`btn-start ${codeValid && countdown === null ? 'active' : 'inactive'}`}
                    onClick={handleStartTest}
                    disabled={!codeValid || countdown !== null}
                  >
                    {countdown !== null ? `inițializare (${countdown})` : 'începe testul →'}
                  </button>
                </div>

              </div>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.04)',
                padding: '12px 32px',
                background: 'rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase' }}>
                  Departamentul Medical FPlayT
                </p>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
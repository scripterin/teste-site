'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';
import RegulamentScreen from '@/components/RegulamentScreen';
import CountdownOverlay from '@/components/CountdownOverlay';

const COOLDOWN_SOLICITA = 90; // 1 minut 30 secunde

const ToastContent = ({ type, text }) => {
  const icons = {
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5BDBC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  };
  const borderColors = { success: 'rgba(34,197,94,0.35)', error: 'rgba(255,59,78,0.35)', info: 'rgba(229,189,185,0.25)' };
  const iconBg = { success: 'rgba(34,197,94,0.12)', error: 'rgba(255,59,78,0.12)', info: 'rgba(255,255,255,0.06)' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 16px',
      background: 'rgba(15,10,10,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${borderColors[type] || borderColors.info}`,
      borderRadius: 14,
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      minWidth: 260,
      maxWidth: 340,
    }}>
      <div style={{
        flexShrink: 0,
        width: 30, height: 30,
        borderRadius: 9,
        background: iconBg[type] || iconBg.info,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icons[type] || icons.info}
      </div>
      <p style={{
        fontFamily: "'Hanken Grotesk', sans-serif",
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(229,225,230,0.9)',
        margin: 0,
        lineHeight: 1.4,
      }}>
        {text}
      </p>
    </div>
  );
};

const notify = (type, text) => {
  toast.custom(() => <ToastContent type={type} text={text} />, { duration: 4500 });
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

  // ✅ Verifică pe server dacă mai există un cooldown activ (supraviețuiește refresh/reintrare)
  useEffect(() => {
    const checkCooldownStatus = async () => {
      try {
        const res = await fetch('/api/cooldown-status');
        const data = await res.json();
        if (data.remainingSeconds > 0) {
          setCooldownSolicita(data.remainingSeconds);
        }
      } catch (e) {
        console.error('Eroare verificare cooldown:', e);
      }
    };
    checkCooldownStatus();
  }, []);

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
      if (res.status === 429) {
        notify('error', data.error || 'Trebuie să mai aștepți.');
        setCooldownSolicita(data.retryAfterSeconds || COOLDOWN_SOLICITA);
      } else if (!res.ok) {
        notify('error', data.error || 'Eroare la generare.');
      } else {
        notify('success', 'Codul a fost trimis pe Discord — verifică mesajele private!');
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
        <Toaster position="bottom-right" />
        <RegulamentScreen onAccept={handleAcceptRegulament} />
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .dash-card-in { animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .btn-solicita {
          width: 100%;
          padding: 15px;
          background: transparent;
          border: 1px solid rgba(255,59,78,0.4);
          border-radius: 14px;
          color: #FF3B4E;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-solicita:hover:not(:disabled) {
          background: rgba(255,59,78,0.08);
          border-color: #FF3B4E;
        }
        .btn-solicita:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-start {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .btn-start.active {
          background: linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%);
          color: #fff;
          box-shadow: 0 8px 32px rgba(255,59,78,0.4);
        }
        .btn-start.active:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255,59,78,0.55);
        }
        .btn-start.inactive {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }

        .code-input {
          width: 100%;
          height: 66px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: 0.5em;
          padding-left: 0.5em;
          color: #E5E1E6;
          outline: none;
          transition: all 0.25s ease;
        }
        .code-input:focus {
          border-color: rgba(255,59,78,0.6);
          box-shadow: 0 0 0 3px rgba(255,59,78,0.12);
        }
        .code-input.valid {
          border-color: #FF3B4E;
          color: #FF3B4E;
          box-shadow: 0 0 24px rgba(255,59,78,0.15);
        }
        .code-input::placeholder { color: rgba(255,255,255,0.1); letter-spacing: 0.4em; }

        .dash-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .dash-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
        }

        .cooldown-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 0 4px;
          animation: fadeUp 0.3s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cooldown-ring { position: relative; width: 72px; height: 72px; }
        .cooldown-ring svg { transform: rotate(-90deg); }
        .cooldown-ring-track { stroke: rgba(255,59,78,0.12); fill: none; }
        .cooldown-ring-fill {
          fill: none;
          stroke: #FF3B4E;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 6px rgba(255,59,78,0.6));
        }
        .cooldown-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #FF3B4E;
        }
        .cooldown-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          text-align: center;
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        <Toaster position="bottom-right" />
        <Navbar />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div className="dash-card-in" style={{ width: '100%', maxWidth: 460 }}>

            <div style={{
              background: 'rgba(15,10,10,0.72)',
              backdropFilter: 'blur(32px) saturate(140%)',
              WebkitBackdropFilter: 'blur(32px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 28,
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>

              <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 30 }}>

                <header>
                  <h1 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 40,
                    letterSpacing: '-0.02em',
                    color: '#E5E1E6',
                    lineHeight: 1.05,
                    margin: 0,
                  }}>
                    Alege<br /><span style={{
                      background: 'linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}>testul</span>
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
                  />
                  {loadingValidate && (
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#FF3B4E', marginTop: 10, letterSpacing: '0.1em' }}>
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
                    {countdown !== null ? 'se pregătește...' : 'începe testul →'}
                  </button>
                </div>

              </div>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '14px 36px',
                background: 'rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: 'rgba(229,225,230,0.35)',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                  Departamentul Medical FPlayT
                </p>
              </div>

            </div>
          </div>
        </main>

        <CountdownOverlay count={countdown} />
      </div>
    </>
  );
}
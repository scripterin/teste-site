'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TestButtons from '@/components/TestButtons';

const notify = (type, text) => {
  const base = {
    background: '#111',
    color: '#F0EAE8',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.12em',
    padding: '12px 18px',
    borderRadius: '6px',
    fontFamily: "'DM Mono', monospace",
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
  };
  const themes = {
    success: { ...base, borderLeft: '3px solid #C0392B' },
    error:   { ...base, borderLeft: '3px solid #7C3030', color: '#ffb3b0' },
    info:    { ...base, borderLeft: '3px solid #555', color: '#aaa' },
  };
  toast(text, { style: themes[type] || themes.info, icon: null });
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
    else { setCodeValid(false); setValidatedTest(null); }
  }, [code]);

  const handleGenerateCode = async () => {
    if (!selectedTest) return notify('error', 'Selectează un test');
    setLoadingGenerate(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSelectat: selectedTest }),
      });
      const data = await res.json();
      if (!res.ok) notify('error', data.error || 'Eroare la generare.');
      else notify('success', 'Cod trimis pe Discord');
    } catch { notify('error', 'Eroare de conexiune.'); }
    finally { setLoadingGenerate(false); }
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
      if (res.ok) { setCodeValid(true); setValidatedTest(data.testSelectat); notify('success', 'Cod valid'); }
      else { setCodeValid(false); notify('error', 'Cod invalid'); }
    } catch { setCodeValid(false); }
    finally { setLoadingValidate(false); }
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          min-height: 100vh;
          background: #0A0808;
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Grain overlay */
        .dash-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 0;
        }

        /* Red glow top-left */
        .dash-root::after {
          content: '';
          position: fixed;
          top: -200px;
          left: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .dash-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 40px;
          position: relative;
          z-index: 1;
        }

        .dash-card {
          width: 100%;
          max-width: 460px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .dash-header {
          margin-bottom: 40px;
        }

        .dash-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.3em;
          color: #C0392B;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dash-eyebrow::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #C0392B;
        }

        .dash-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          letter-spacing: 0.04em;
          color: #F0EAE8;
          line-height: 0.95;
          margin-bottom: 12px;
        }

        .dash-title span { color: #C0392B; }

        .dash-subtitle {
          font-size: 12px;
          color: #4A4040;
          letter-spacing: 0.05em;
          font-weight: 300;
        }

        /* Divider */
        .dash-divider {
          height: 1px;
          background: linear-gradient(to right, #2E2724, transparent);
          margin: 28px 0;
        }

        /* Section label */
        .dash-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #3A3030;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        /* Code input */
        .code-input-wrap {
          position: relative;
          margin-bottom: 24px;
        }

        .code-input {
          width: 100%;
          height: 64px;
          background: #0F0D0D;
          border: 1px solid #1E1A18;
          border-radius: 6px;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 26px;
          letter-spacing: 0.5em;
          color: #F0EAE8;
          outline: none;
          transition: border-color 0.2s;
          padding-left: 0.5em; /* compensate letter-spacing */
        }

        .code-input:focus {
          border-color: #C0392B;
        }

        .code-input.valid {
          border-color: #C0392B;
          color: #C0392B;
        }

        .code-input::placeholder { color: #2A2220; letter-spacing: 0.4em; }

        .code-status {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #C0392B;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .code-status.visible { opacity: 1; }

        /* Buttons */
        .btn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 28px;
        }

        .btn {
          height: 52px;
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #2E2724;
          color: #8A7E7C;
        }

        .btn-outline:hover:not(:disabled) {
          border-color: #C0392B;
          color: #C0392B;
        }

        .btn-outline:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-solid {
          background: #C0392B;
          color: #fff;
        }

        .btn-solid:hover:not(:disabled) { background: #A93226; }
        .btn-solid:disabled { background: #1E1A18; color: #3A3030; cursor: not-allowed; }
        .btn-solid:active:not(:disabled) { transform: scale(0.98); }

        /* Countdown ring */
        .countdown-ring {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.3);
          font-size: 11px;
          font-weight: 700;
        }

        /* Footer */
        .dash-footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 20px;
        }

        .dash-footer p {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.3em;
          color: #1E1A18;
          text-transform: uppercase;
        }
      `}</style>

      <div className="dash-root">
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
        <Navbar />

        <main className="dash-main">
          <div className="dash-card">

            {/* Header */}
            <div className="dash-header">
              <p className="dash-eyebrow">Sistem Examinare</p>
              <h1 className="dash-title">
                DEP.<br /><span>MEDICAL</span>
              </h1>
              <p className="dash-subtitle">Selectează testul și solicită codul de acces</p>
            </div>

            <div className="dash-divider" />

            {/* Test selection */}
            <div>
              <p className="dash-label">Tip test</p>
              <TestButtons selected={selectedTest} onSelect={setSelectedTest} />
            </div>

            <div className="dash-divider" />

            {/* Code input */}
            <div>
              <p className="dash-label">Cod de acces</p>
              <div className="code-input-wrap">
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
                <span className={`code-status${loadingValidate ? ' visible' : ''}`}>
                  verificare...
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="btn-row">
              <button
                className="btn btn-outline"
                onClick={handleGenerateCode}
                disabled={loadingGenerate || !selectedTest}
              >
                {loadingGenerate ? 'generare...' : '+ solicită cod'}
              </button>

              <button
                className="btn btn-solid"
                onClick={handleStartTest}
                disabled={!codeValid || countdown !== null}
              >
                {countdown !== null ? (
                  <>
                    <span className="countdown-ring">{countdown}</span>
                    start...
                  </>
                ) : 'începe testul →'}
              </button>
            </div>

          </div>
        </main>

        <footer className="dash-footer">
          <p>Departamentul Medical FPlayT · Sistem Securizat</p>
        </footer>
      </div>
    </>
  );
}
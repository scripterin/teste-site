'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function generateEcgPath(cycles, cycleWidth, height, baseline) {
  let d = `M0,${baseline}`;
  for (let i = 0; i < cycles; i++) {
    const x = i * cycleWidth;
    d += ` L${x + 22},${baseline}`;
    d += ` L${x + 32},${baseline - 6}`;
    d += ` L${x + 40},${baseline + 5}`;
    d += ` L${x + 48},${baseline - height * 0.85}`;
    d += ` L${x + 56},${baseline + height * 0.55}`;
    d += ` L${x + 64},${baseline}`;
    d += ` L${x + cycleWidth},${baseline}`;
  }
  return d;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      signOut({ redirect: false }).then(() => {
        router.refresh();
      });
    }
  }, [status, router]);

  const cycles = 6;
  const cycleWidth = 110;
  const ecgHeight = 60;
  const baseline = 32;
  const totalWidth = cycles * cycleWidth;
  const ecgPath = generateEcgPath(cycles, cycleWidth, ecgHeight, baseline);

  if (status === 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 34, height: 34, border: '2px solid #A3172A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        html, body { margin: 0; background: #F8F6F1; }

        .auth-grid {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
        }
        @media (max-width: 880px) {
          .auth-grid { grid-template-columns: 1fr; }
          .auth-left { min-height: 280px; }
        }

        .auth-left {
          position: relative;
          background: linear-gradient(160deg, #3A0E12 0%, #6E1B22 65%, #7E2029 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: 0.5;
          pointer-events: none;
        }

        .ecg-track {
          position: relative;
          width: 100%;
          height: 60px;
          overflow: hidden;
          margin: 28px 0 32px;
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .ecg-scroll {
          display: flex;
          width: ${totalWidth * 2}px;
          animation: ecgMove 5.5s linear infinite;
        }
        @keyframes ecgMove {
          from { transform: translateX(0); }
          to { transform: translateX(-${totalWidth}px); }
        }

        .right-panel {
          background: #F8F6F1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
        }

        .form-card {
          width: 100%;
          max-width: 380px;
        }

        .btn-discord {
          width: 100%;
          padding: 17px;
          background: #A3172A;
          border: none;
          border-radius: 10px;
          color: #F8F6F1;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .btn-discord:hover { background: #841221; transform: translateY(-1px); }
        .btn-discord:active { transform: translateY(0); }

        .field-line {
          height: 1px;
          background: #E7E1D6;
        }
      `}</style>

      <div className="auth-grid">

        {/* PANOU STÂNGA — identitate / semnătură vizuală */}
        <div className="auth-left">
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.32em',
            color: 'rgba(248,246,241,0.55)',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Departamentul Medical &middot; FPlayT
          </p>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 'clamp(34px, 5vw, 54px)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            color: '#F8F6F1',
            margin: '18px 0 0',
          }}>
            Fiecare acces,<br /><span style={{ fontStyle: 'italic', color: '#F1A79E' }}>verificat.</span>
          </h1>

          <div className="ecg-track">
            <div className="ecg-scroll">
              <svg width={totalWidth} height={ecgHeight + 10} viewBox={`0 0 ${totalWidth} ${ecgHeight + 10}`}>
                <path d={ecgPath} fill="none" stroke="#F1A79E" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <svg width={totalWidth} height={ecgHeight + 10} viewBox={`0 0 ${totalWidth} ${ecgHeight + 10}`}>
                <path d={ecgPath} fill="none" stroke="#F1A79E" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            lineHeight: 1.7,
            color: 'rgba(248,246,241,0.72)',
            maxWidth: 400,
            margin: 0,
          }}>
            Sistemul de testare al Departamentului Medical. Autentificarea prin Discord confirmă identitatea înainte de orice evaluare sau certificare.
          </p>
        </div>

        {/* PANOU DREAPTA — formular */}
        <div className="right-panel">
          <div className="form-card">
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.28em',
              color: '#A3172A',
              textTransform: 'uppercase',
              margin: '0 0 10px',
            }}>
              Autentificare
            </p>

            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 27,
              color: '#1E1B19',
              margin: '0 0 28px',
              lineHeight: 1.2,
            }}>
              Conectează-te pentru a continua
            </h2>

            <div className="field-line" style={{ marginBottom: 28 }} />

            <button
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              className="btn-discord"
            >
              Conectare prin Discord
            </button>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: '#9C948B',
              marginTop: 18,
              lineHeight: 1.6,
            }}>
              Ai nevoie de contul de Discord al comunității pentru a accesa testele.
            </p>

            <div style={{ marginTop: 48 }}>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#C4BCB0',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                &copy; 2026 Departamentul Medical FPlayT
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
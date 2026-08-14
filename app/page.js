'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  if (status === 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 34, height: 34, border: '2px solid #FF3B4E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        html, body { margin: 0; background: #0A0A0D; overflow-x: hidden; }

        .scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }
        .blob-1 {
          width: 520px; height: 520px;
          top: -140px; left: -120px;
          background: radial-gradient(circle at 30% 30%, #FF3B4E, #7A0F1E 70%);
          animation: float1 14s ease-in-out infinite;
        }
        .blob-2 {
          width: 460px; height: 460px;
          bottom: -160px; right: -100px;
          background: radial-gradient(circle at 60% 40%, #FF6B4A, #5C0E14 70%);
          animation: float2 17s ease-in-out infinite;
        }
        .blob-3 {
          width: 300px; height: 300px;
          top: 50%; right: 12%;
          background: radial-gradient(circle, #FF8A9B, #4A0A12 75%);
          opacity: 0.35;
          animation: float3 12s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(60px,40px) scale(1.08); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-50px,-30px) scale(1.05); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(-30px,50px); }
        }

        .grain {
          position: fixed;
          inset: 0;
          z-index: 1;
          opacity: 0.035;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px);
          background-size: 3px 3px;
        }

        .glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.055);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 28px;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 0 0 1px rgba(255,255,255,0.03);
          overflow: hidden;
          animation: cardIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(26px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .glass-sheen {
          position: absolute;
          top: 0; left: -40%;
          width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.06), transparent);
          transform: skewX(-15deg);
          animation: sheen 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes sheen {
          0% { left: -40%; }
          35%, 100% { left: 130%; }
        }

        .badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #FF3B4E;
          box-shadow: 0 0 12px 2px rgba(255,59,78,0.7);
        }

        .divider-glass {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent);
        }

        .btn-discord {
          position: relative;
          width: 100%;
          padding: 17px;
          background: linear-gradient(135deg, #FF3B4E, #C41730);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 12px 30px rgba(255,59,78,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .btn-discord:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(255,59,78,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .btn-discord:active { transform: translateY(0); }
        .btn-discord::after {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-15deg);
          transition: left 0.6s ease;
        }
        .btn-discord:hover::after { left: 130%; }
      `}</style>

      <div className="scene">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grain" />

        <div className="glass-card">
          <div className="glass-sheen" />

          <div style={{ padding: '46px 38px 38px', display: 'flex', flexDirection: 'column', gap: 26 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div className="badge-dot" />
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10.5,
                letterSpacing: '0.24em',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                Departamentul Medical &middot; FPlayT
              </p>
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Intră în<br /><span style={{
                background: 'linear-gradient(135deg, #FF6B7A, #FF3B4E 60%, #FF8A5C)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}>sistem.</span>
            </h1>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.55)',
              margin: 0,
            }}>
              Autentifică-te cu contul de Discord al comunității ca să accesezi testele de certificare.
            </p>

            <div className="divider-glass" />

            <button
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              className="btn-discord"
            >
              Conectare prin Discord
            </button>

          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 38px',
            background: 'rgba(0,0,0,0.15)',
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              &copy; 2026 Departamentul Medical FPlayT
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
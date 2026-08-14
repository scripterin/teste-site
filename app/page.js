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
      <div className="min-h-screen bg-[#F4F2ED] flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-[#1F4B47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        html, body { background: #F4F2ED; }

        .login-card {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .paper-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background-color: #F4F2ED;
          background-image:
            radial-gradient(circle at 20% 15%, rgba(31,75,71,0.05), transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(31,75,71,0.04), transparent 40%);
        }

        .cross-mark {
          width: 22px;
          height: 22px;
          position: relative;
          margin: 0 auto 22px;
        }
        .cross-mark::before, .cross-mark::after {
          content: '';
          position: absolute;
          background: #1F4B47;
        }
        .cross-mark::before {
          width: 100%; height: 3px;
          top: 50%; left: 0;
          transform: translateY(-50%);
        }
        .cross-mark::after {
          height: 100%; width: 3px;
          left: 50%; top: 0;
          transform: translateX(-50%);
        }

        .divider-line {
          height: 1px;
          background: #DEDAD1;
        }

        .btn-discord {
          width: 100%;
          padding: 17px;
          background: #1F4B47;
          border: none;
          border-radius: 10px;
          color: #F4F2ED;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-discord:hover {
          background: #163934;
          transform: translateY(-1px);
        }

        .btn-discord:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="paper-bg" />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div className="login-card" style={{ width: '100%', maxWidth: 400 }}>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #DEDAD1',
            borderRadius: 16,
            boxShadow: '0 24px 60px rgba(30,36,34,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{ height: 3, background: '#1F4B47' }} />

            <div style={{ padding: '48px 40px 40px', display: 'flex', flexDirection: 'column', gap: 30 }}>

              <header style={{ textAlign: 'center' }}>
                <div className="cross-mark" />
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  color: '#1F4B47',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}>
                  Sistem de autentificare
                </p>
                <h1 style={{
                  fontFamily: "'Fraunces', serif",
                  fontOpticalSizing: 'auto',
                  fontWeight: 500,
                  fontSize: 38,
                  letterSpacing: '-0.01em',
                  color: '#1E2422',
                  lineHeight: 1.1,
                  margin: 0,
                }}>
                  Acces Departament<br /><span style={{ color: '#1F4B47', fontStyle: 'italic' }}>Medical</span>
                </h1>
              </header>

              <div className="divider-line" />

              <p style={{
                fontSize: 13,
                color: '#6B7570',
                lineHeight: 1.65,
                fontFamily: "'Inter', sans-serif",
                textAlign: 'center',
                margin: 0,
              }}>
                Autentifică-te cu contul de Discord al comunității pentru a accesa testele de certificare.
              </p>

              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="btn-discord"
              >
                Conectare prin Discord
              </button>

            </div>

            <div style={{
              borderTop: '1px solid #EDEAE2',
              padding: '16px 32px',
              background: '#FAF9F6',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#A6A198',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                Departamentul Medical FPlayT &middot; 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Dacă vrei să forțezi logout la accesarea paginii de start, păstrăm logica ta:
      signOut({ redirect: false }).then(() => {
        router.refresh();
      });
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-[#0F0D0D] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .login-card {
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-discord {
          width: 100%;
          padding: 16px;
          background: #5865F2;
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(88, 101, 242, 0.2);
        }

        .btn-discord:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(88, 101, 242, 0.3);
        }

        .btn-discord:active {
          transform: translateY(0);
        }

        .dash-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
          margin: 4px 0;
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0F0D0D', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div className="login-card" style={{ width: '100%', maxWidth: 400 }}>
          
          <div style={{
            background: 'rgba(18,14,12,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {/* Accent top roșu tipic dashboard-ului */}
            <div style={{ height: 3, background: 'linear-gradient(to right, #C0392B, #7C3030)' }} />

            <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Header Branding */}
              <header style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.4em', color: '#C0392B', marginBottom: 12, textTransform: 'uppercase' }}>
                  Autentificare Securizată
                </p>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: '0.02em', color: '#F0EAE8', lineHeight: 0.9, margin: 0 }}>
                  ACCES<br /><span style={{ color: '#C0392B' }}>MEDICAL</span>
                </h1>
              </header>

              <div className="dash-divider" />

              {/* Mesaj informativ */}
              <div style={{ textAlign: 'center', spaceY: '8px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(240, 234, 232, 0.7)', lineHeight: '1.6' }}>
                  Pentru a accesa platforma de teste medicale FPlayT, te rugăm să te conectezi folosind contul tău de Discord.
                </p>
              </div>

              {/* Buton Discord */}
              <button 
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="btn-discord"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Conectare cu Discord
              </button>

            </div>

            {/* Footer subtil */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              padding: '16px 32px',
              background: 'rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', margin: 0 }}>
                Departamentul Medical
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
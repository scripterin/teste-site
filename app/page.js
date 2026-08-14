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
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-discord {
          width: 100%;
          padding: 18px;
          background: #C0392B; /* Schimbat la roșu pentru unitate cu dashboard-ul */
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(192, 57, 43, 0.2);
        }

        .btn-discord:hover {
          background: #A93226;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(192, 57, 43, 0.3);
        }

        .btn-discord:active {
          transform: translateY(0);
        }

        .dash-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          margin: 4px 0;
        }

        .bg-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15, 13, 13, 0.8), rgba(15, 13, 13, 0.95));
          z-index: -1;
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: 'url("/image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Overlay pentru a asigura contrastul textului */}
        <div className="bg-overlay" />

        <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>
          
          <div style={{
            background: 'rgba(18,14,12,0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {/* Accent top tipic dashboard-ului */}
            <div style={{ height: 3, background: 'linear-gradient(to right, transparent, #C0392B, transparent)' }} />

            <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: 36 }}>
              
              {/* Header Branding */}
              <header style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.45em', color: '#C0392B', marginBottom: 14, textTransform: 'uppercase' }}>
                  Sistem Autentificare
                </p>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, letterSpacing: '0.02em', color: '#F0EAE8', lineHeight: 0.9, margin: 0 }}>
                  ACCES<br /><span style={{ color: '#C0392B' }}>MEDICAL</span>
                </h1>
              </header>

              <div className="dash-divider" />

              {/* Mesaj informativ */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: 'rgba(240, 234, 232, 0.6)', 
                  lineHeight: '1.8', 
                  fontFamily: "'DM Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Autentifică-te pentru a accesa testele.
                </p>
              </div>

              {/* Buton Login - Fără Iconiță */}
              <button 
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="btn-discord"
              >
                Conectare prin Discord
              </button>

            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.03)',
              padding: '20px 32px',
              background: 'rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', margin: 0 }}>
                Departamentul Medical FPlayT &copy; 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
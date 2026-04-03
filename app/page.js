'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect la dashboard DOAR dacă sesiunea este confirmată 100%
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Design-ul de loading stilizat FPLAYT
  // Este esențial să existe, altfel vezi doar background-ul în timp ce NextAuth procesează callback-ul
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A7E7C] text-[10px] uppercase font-bold tracking-widest">Sistemul verifică autorizarea...</p>
        </div>
      </div>
    );
  }

  // Dacă suntem în proces de redirect, nu afișăm cardul
  if (status === 'authenticated') return null;

  return (
    <div className="dark bg-[#0F0D0D] text-[#e8e1e0] min-h-screen flex flex-col overflow-x-hidden font-['Inter'] relative">
      <style jsx global>{`
        .vignette-glow {
          background: radial-gradient(circle, rgba(142, 19, 12, 0.12) 0%, rgba(15, 13, 13, 0) 70%);
        }
        .discord-brand-subtle {
          color: #5865F2;
          opacity: 0.8;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0D0D] border-b border-[#2E2724] h-[52px] flex justify-between items-center px-6">
        <div className="flex items-center">
          <span className="text-xl font-black text-[#F0EAE8] tracking-[-0.02em]">
            FPLAYT
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#8A7E7C]">Vizitator</span>
            <div className="w-8 h-8 rounded-full bg-[#373434] flex items-center justify-center text-[#e1bfb9] border border-[#2E2724]">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-20">
        <div className="absolute inset-0 vignette-glow pointer-events-none"></div>
        
        <div className="relative w-full max-w-[440px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#C0392B]">
          <div className="p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#231E1C] border border-[#2E2724] flex items-center justify-center mb-2 shadow-inner">
                <svg className="w-10 h-10 discord-brand-subtle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#F0EAE8] tracking-tight uppercase">Conectează contul Discord</h2>
              <p className="text-sm text-[#8A7E7C] leading-relaxed max-w-[320px]">
                Pentru a continua procesul de examinare, trebuie să sincronizezi identitatea ta cu serverul nostru.
              </p>
            </div>

            <div className="bg-[#231E1C] rounded-lg border border-[#2E2724] p-5 text-left">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-sm text-[#C0392B] mt-0.5">verified_user</span>
                <div>
                  <p className="text-[13px] font-bold text-[#F0EAE8]">Permisiuni Solicitate</p>
                  <ul className="mt-1 space-y-2">
                    <li className="text-[12px] text-[#8A7E7C] flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B]"></div>
                      Acces la ID-ul tău de utilizator
                    </li>
                    <li className="text-[12px] text-[#8A7E7C] flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B]"></div>
                      Verificarea apartenenței pe server
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                className="w-full py-4 bg-[#C0392B] text-[#F0EAE8] rounded-lg font-black text-sm flex items-center justify-center gap-3 hover:bg-[#A93226] transition-all active:scale-[0.98] shadow-lg shadow-[#C0392B]/10 uppercase tracking-widest cursor-pointer"
              >
                AUTORIZEAZĂ CU DISCORD
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          </div>
          
          <footer className="border-t border-[#2E2724] py-4 bg-[#141110]">
            <p className="text-[10px] text-center text-[#8A7E7C]/40 font-medium uppercase tracking-[0.1em]">
              Protocol de securitate OAuth 2.0 activ
            </p>
          </footer>
        </div>
      </main>

      <footer className="fixed bottom-4 w-full flex justify-center items-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#E1BFB9]/50 opacity-40">
          Powered by FPLAYT · Sistem securizat
        </p>
      </footer>
    </div>
  );
}
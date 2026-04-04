'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      
      if (justLoggedIn) {
        sessionStorage.removeItem('justLoggedIn');
        router.push('/dashboard');
      } else {
        signOut({ redirect: false }).then(() => {
          router.refresh();
        });
      }
    }
  }, [status]);

  if (status === 'authenticated') {
    return (
      <div className={`min-h-screen bg-[#0F0D0D] flex items-center justify-center ${inter.className}`}>
        <div className="w-10 h-10 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`dark bg-[#0F0D0D] text-[#e8e1e0] min-h-screen flex flex-col overflow-x-hidden relative ${inter.className}`}>
      <style jsx global>{`
        .vignette-glow { background: radial-gradient(circle, rgba(142, 19, 12, 0.15) 0%, rgba(15, 13, 13, 0) 75%); }
        .discord-brand-subtle { color: #5865F2; opacity: 0.9; filter: drop-shadow(0 0 8px rgba(88, 101, 242, 0.3)); }
        .font-fplayt { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
      `}</style>

      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-10">
        <div className="absolute inset-0 vignette-glow pointer-events-none"></div>
        
        <div className="relative w-full max-w-[420px] bg-[#141211] rounded-2xl border border-[#2E2724] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#C0392B]">
          <div className="p-12 space-y-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-[#1A1614] rounded-2xl border border-[#2E2724] shadow-inner">
                <svg className="w-12 h-12 discord-brand-subtle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-fplayt text-[#F0EAE8]">LOGIN SISTEM</h2>
                <p className="text-[13px] font-medium text-[#8A7E7C] leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">
                  Autorizează identitatea prin Discord pentru a accesa panoul medical.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                sessionStorage.setItem('justLoggedIn', 'true');
                signIn('discord');
              }}
              className="group relative w-full py-5 bg-[#C0392B] text-white rounded-xl font-black text-sm transition-all hover:bg-[#A93226] active:scale-[0.98] shadow-[0_10px_20px_rgba(192,57,43,0.2)] uppercase tracking-[0.2em] overflow-hidden"
            >
              <span className="relative z-10">Conectează-te acum</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
          
          <footer className="border-t border-[#2E2724] py-5 bg-[#0D0B0A] text-center">
            <p className="text-[9px] font-bold text-[#8A7E7C]/60 uppercase tracking-[0.3em]">
              Sincronizare OAuth Securizată
            </p>
          </footer>
        </div>
      </main>

      <footer className="fixed bottom-6 w-full flex justify-center items-center pointer-events-none opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E1BFB9]">
          Departamentul Medical FPLAYT
        </p>
      </footer>
    </div>
  );
}
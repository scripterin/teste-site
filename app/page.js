'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Dacă e deja logat, punem un loader până pleacă la dashboard
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-[#0F0D0D] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark bg-[#0F0D0D] text-[#e8e1e0] min-h-screen flex flex-col overflow-x-hidden font-['Inter'] relative">
      <style jsx global>{`
        .vignette-glow { background: radial-gradient(circle, rgba(142, 19, 12, 0.12) 0%, rgba(15, 13, 13, 0) 70%); }
        .discord-brand-subtle { color: #5865F2; opacity: 0.8; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0D0D] border-b border-[#2E2724] h-[52px] flex justify-between items-center px-6">
        <span className="text-xl font-black text-[#F0EAE8]">FPLAYT</span>
      </nav>

      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-20">
        <div className="absolute inset-0 vignette-glow pointer-events-none"></div>
        
        <div className="relative w-full max-w-[440px] bg-[#1A1614] rounded-xl border border-[#2E2724] shadow-2xl overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#C0392B]">
          <div className="p-10 space-y-8 text-center">
            <h2 className="text-2xl font-bold text-[#F0EAE8] uppercase italic">Conectare Discord</h2>
            <p className="text-sm text-[#8A7E7C]">Sincronizează-ți identitatea pentru platforma FPLAYT.</p>

            <button 
              onClick={() => signIn('discord')}
              className="w-full py-4 bg-[#C0392B] text-[#F0EAE8] rounded-lg font-black text-sm hover:bg-[#A93226] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              AUTORIZEAZĂ CU DISCORD
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
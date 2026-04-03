'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (!session) return null;

  const user = session.user;
  const username = user.username || user.name || 'utilizator';
  const avatar = user.avatar || user.image;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 py-4">
      {/* User info right */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00B4D8]/40 rounded-xl px-4 py-2 transition-all duration-300"
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={username}
              width={32}
              height={32}
              className="rounded-full border border-[#00B4D8]/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/30 flex items-center justify-center">
              <span className="text-[#00B4D8] text-sm font-bold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-white/80 font-body text-sm font-medium hidden sm:block">
            @{username}
          </span>
          <svg
            className={`w-4 h-4 text-white/40 transition-transform ${showMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0d1b2a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white/40 text-xs font-body">Conectat ca</p>
              <p className="text-white font-body font-semibold text-sm truncate">@{username}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#E63946] hover:bg-[#E63946]/10 transition-colors font-body text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Deconectare
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const user = session.user;
  const username = user.username || user.name || 'utilizator';
  const avatar = user.avatar || user.image;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {avatar ? (
          <Image
            src={avatar}
            alt={username}
            width={34}
            height={34}
            className="rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          />
        ) : (
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(192,57,43,0.15)',
            border: '1px solid rgba(192,57,43,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#C0392B',
          }}>
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Username */}
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(240,234,232,0.7)',
          letterSpacing: '0.01em',
        }}>
          @{username}
        </span>

        {/* Separator */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

        {/* Deconectare */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(192,57,43,0.8)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.03em',
            padding: '4px 0',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,57,43,0.8)'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Ieși
        </button>
      </div>
    </nav>
  );
}
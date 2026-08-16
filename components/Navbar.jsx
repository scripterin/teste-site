'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const user = session.user;
  const username = user.username || user.name || 'utilizator';
  const avatar = user.avatar || user.image;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '18px 28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 14px 6px 6px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={username}
            width={30}
            height={30}
            className="rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,59,78,0.25) 0%, rgba(191,0,42,0.2) 100%)',
              border: '1px solid rgba(255,59,78,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: '#FF3B4E',
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <span
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: 12.5,
            fontWeight: 500,
            color: 'rgba(229,225,230,0.75)',
            letterSpacing: '0.01em',
          }}
        >
          @{username}
        </span>
      </div>
    </nav>
  );
}
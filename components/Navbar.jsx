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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 py-4">
      <div className="flex items-center gap-3">
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

        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(240,234,232,0.7)',
          letterSpacing: '0.01em',
        }}>
          @{username}
        </span>
      </div>
    </nav>
  );
}
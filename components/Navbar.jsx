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
    <>
      <style jsx global>{`
        .navbar-wrap {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 12px 24px;
          background: rgba(10,8,8,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar-username {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: rgba(240,234,232,0.5);
          letter-spacing: 0.08em;
        }

        @media (max-width: 480px) {
          .navbar-wrap {
            padding: 10px 16px;
          }
          .navbar-username {
            font-size: 10px;
          }
        }
      `}</style>

      <nav className="navbar-wrap">
        <div className="navbar-user">
          {avatar ? (
            <Image
              src={avatar}
              alt={username}
              width={30}
              height={30}
              style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          ) : (
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(192,57,43,0.15)',
              border: '1px solid rgba(192,57,43,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#C0392B',
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="navbar-username">@{username}</span>
        </div>
      </nav>
    </>
  );
}
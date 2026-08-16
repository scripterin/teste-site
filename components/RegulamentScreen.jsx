'use client';

import { useState } from 'react';

const ARTICLES = [
  {
    title: "Confidențialitate",
    text: "Toate materialele, întrebările și informațiile prezentate în cadrul testelor sunt strict confidențiale. Este interzisă reproducerea, distribuirea sau publicarea conținutului sub orice formă.",
  },
  {
    title: "Comportament în timpul testului",
    text: "Candidații sunt obligați să completeze testul individual, fără ajutor extern. Utilizarea surselor terțe sau comunicarea cu alte persoane în timpul testului atrage descalificarea imediată.",
  },
  {
    title: "Codul de acces",
    text: "Codul de acces este personal și netransmisibil. Utilizarea unui cod aparținând altei persoane constituie o încălcare gravă și poate atrage sancțiuni disciplinare.",
  },
  {
    title: "Rezultate și notare",
    text: "Rezultatele testului sunt înregistrate automat la momentul finalizării. Orice tentativă de manipulare a sistemului sau de falsificare a rezultatelor va fi raportată ierarhic.",
  },
  {
    title: "Acceptarea regulamentului",
    text: "Prin bifarea tuturor punctelor și apăsarea butonului de acceptare, confirmați că ați citit, înțeles și sunteți de acord cu toate prevederile prezentului regulament.",
  },
];

export default function RegulamentScreen({ onAccept }) {
  const [checked, setChecked] = useState(() => new Array(ARTICLES.length).fill(false));
  const [exiting, setExiting] = useState(false);

  const toggleCheck = (i) => {
    setChecked(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const allChecked = checked.every(Boolean);
  const checkedCount = checked.filter(Boolean).length;

  const handleAccept = () => {
    if (!allChecked) return;
    setExiting(true);
    setTimeout(onAccept, 650);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .reg-card-in {
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .reg-scroll::-webkit-scrollbar { display: none; }

        .article-row {
          animation: rowIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .article-row:hover {
          border-color: rgba(255,59,78,0.3);
          background: rgba(255,59,78,0.04);
        }
        .article-row.checked {
          border-color: rgba(255,59,78,0.4);
          background: linear-gradient(135deg, rgba(255,59,78,0.08) 0%, rgba(191,0,42,0.04) 100%);
        }

        .check-box {
          flex-shrink: 0;
          width: 19px;
          height: 19px;
          border-radius: 6px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin-top: 1px;
        }
        .check-box.checked {
          background: linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%);
          border-color: #FF3B4E;
          box-shadow: 0 0 10px rgba(255,59,78,0.4);
        }

        .accept-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 13px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accept-btn.active {
          background: linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%);
          color: #fff;
          box-shadow: 0 6px 24px rgba(255,59,78,0.35);
        }
        .accept-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(255,59,78,0.5);
        }
        .accept-btn.inactive {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
        }

        .progress-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF3B4E, #bf002a);
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 10px rgba(255,59,78,0.5);
        }

        .warn-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 2px 14px;
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .warn-icon-ring {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: rgba(255,59,78,0.1);
          border: 1px solid rgba(255,59,78,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .warn-icon-ring::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 11px;
          border: 1px solid rgba(255,59,78,0.3);
          animation: warnPing 2s ease-out infinite;
        }
        @keyframes warnPing {
          0%   { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-20px)' : 'translateY(0)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: exiting ? 'none' : 'auto',
        position: 'relative',
        zIndex: 2,
      }}>
        <div className="reg-card-in" style={{
          background: 'rgba(15, 10, 10, 0.72)',
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 500,
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>

          <div style={{ padding: '26px 26px 20px', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '-0.02em',
              color: '#E5E1E6',
              lineHeight: 1.1,
              margin: '0 0 4px',
              flexShrink: 0,
            }}>
              Regula<span style={{
                background: 'linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}>ment</span>
            </h1>

            <p style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 12,
              color: 'rgba(229,225,230,0.5)',
              margin: '0 0 16px',
              lineHeight: 1.4,
              flexShrink: 0,
            }}>
              Bifează fiecare punct pentru a confirma că l-ai citit și înțeles.
            </p>

            <div className="warn-strip" style={{ flexShrink: 0 }}>
              <div className="warn-icon-ring">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF3B4E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: 11.5,
                color: 'rgba(229,225,230,0.75)',
                margin: 0,
                lineHeight: 1.4,
              }}>
                <span style={{ color: '#FF3B4E', fontWeight: 600 }}>Nu schimba fereastra</span> sau apăsa ALT+TAB pe durata testului — atrage descalificare automată.
              </p>
            </div>

            <div
              className="reg-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                marginBottom: 14,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                minHeight: 0,
              }}
            >
              {ARTICLES.map((art, i) => (
                <div
                  key={i}
                  className={`article-row${checked[i] ? ' checked' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`check-box${checked[i] ? ' checked' : ''}`}>
                    {checked[i] && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: '0.08em',
                      color: checked[i] ? '#FF3B4E' : 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase',
                      margin: '0 0 3px',
                      transition: 'color 0.25s ease',
                    }}>
                      Art. {i + 1} — {art.title}
                    </p>
                    <p style={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: 11.5,
                      lineHeight: 1.5,
                      color: 'rgba(229,225,230,0.65)',
                      margin: 0,
                    }}>
                      {art.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14, flexShrink: 0 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(checkedCount / ARTICLES.length) * 100}%` }} />
              </div>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                marginTop: 8,
                textAlign: 'center',
              }}>
                {checkedCount} / {ARTICLES.length} confirmate
              </p>
            </div>

            <button
              className={`accept-btn ${allChecked ? 'active' : 'inactive'}`}
              onClick={handleAccept}
              disabled={!allChecked}
              style={{ flexShrink: 0 }}
            >
              {allChecked ? 'Accept regulamentul' : 'Bifează toate punctele'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
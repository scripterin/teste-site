'use client';

import { useEffect, useRef, useState } from 'react';

const ARTICLES = [
  {
    title: "Art. 1 — Confidențialitate",
    text: "Toate materialele, întrebările și informațiile prezentate în cadrul testelor sunt strict confidențiale. Este interzisă reproducerea, distribuirea sau publicarea conținutului sub orice formă.",
  },
  {
    title: "Art. 2 — Comportament în timpul testului",
    text: "Candidații sunt obligați să completeze testul individual, fără ajutor extern. Utilizarea surselor terțe sau comunicarea cu alte persoane în timpul testului atrage descalificarea imediată.",
  },
  {
    title: "Art. 3 — Codul de acces",
    text: "Codul de acces este personal și netransmisibil. Utilizarea unui cod aparținând altei persoane constituie o încălcare gravă și poate atrage sancțiuni disciplinare.",
  },
  {
    title: "Art. 4 — Rezultate și notare",
    text: "Rezultatele testului sunt înregistrate automat la momentul finalizării. Orice tentativă de manipulare a sistemului sau de falsificare a rezultatelor va fi raportată ierarhic.",
  },
  {
    title: "Art. 5 — Acceptarea regulamentului",
    text: "Prin apăsarea butonului de acceptare, confirmați că ați citit, înțeles și sunteți de acord cu toate prevederile prezentului regulament.",
  },
];

export default function RegulamentScreen({ onAccept }) {
  const [articles, setArticles] = useState([]);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let artIdx = 0;
    let charInSection = 0;
    let phase = 'title';
    let timeout;
    const rendered = [];

    function typeNext() {
      if (artIdx >= ARTICLES.length) {
        setDone(true);
        return;
      }
      const art = ARTICLES[artIdx];
      if (phase === 'title') {
        if (charInSection === 0) rendered.push({ title: '', text: '' });
        if (charInSection < art.title.length) {
          rendered[rendered.length - 1].title = art.title.slice(0, charInSection + 1);
          charInSection++;
          setArticles([...rendered]);
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          timeout = setTimeout(typeNext, 28);
        } else {
          charInSection = 0;
          phase = 'text';
          timeout = setTimeout(typeNext, 60);
        }
      } else {
        if (charInSection < art.text.length) {
          rendered[rendered.length - 1].text = art.text.slice(0, charInSection + 1);
          charInSection++;
          setArticles([...rendered]);
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          timeout = setTimeout(typeNext, 18);
        } else {
          charInSection = 0;
          phase = 'title';
          artIdx++;
          timeout = setTimeout(typeNext, 200);
        }
      }
    }

    const start = setTimeout(typeNext, 500);
    return () => { clearTimeout(start); clearTimeout(timeout); };
  }, []);

  const handleAccept = () => {
    setExiting(true);
    setTimeout(onAccept, 650);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .reg-scroll::-webkit-scrollbar {
          display: none;
        }

        .cursor-blink {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #C0392B;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: cursorBlink 0.8s step-end infinite;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .accept-btn {
          width: 100%;
          padding: 15px;
          background: #C0392B;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          animation: fadeUp 0.4s ease both;
        }
        .accept-btn:hover { background: #A93226; transform: translateY(-1px); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-24px)' : 'translateY(0)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: exiting ? 'none' : 'auto',
      }}>
        <div style={{
          background: 'rgba(18,14,12,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #C0392B, transparent)' }} />

          <div style={{ padding: '36px 32px' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#C0392B', marginBottom: 8, textTransform: 'uppercase' }}>
              Departamentul Medical FPlayT
            </p>

            {/* Titlu pe un singur rând */}
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 46,
              letterSpacing: '0.04em',
              color: '#F0EAE8',
              lineHeight: 1,
              marginBottom: 28,
              whiteSpace: 'nowrap',
            }}>
              REGULA<span style={{ color: '#C0392B' }}>MENT</span>
            </h1>

            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: 24 }} />

            {/* Scroll fără bară vizibilă */}
            <div
              className="reg-scroll"
              ref={scrollRef}
              style={{
                maxHeight: 300,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                paddingRight: 0,
                marginBottom: 24,
              }}
            >
              {articles.map((art, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: '#C0392B',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    {art.title}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: 'rgba(240,234,232,0.7)',
                  }}>
                    {art.text}
                    {i === articles.length - 1 && !done && (
                      <span className="cursor-blink" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {done && (
              <button className="accept-btn" onClick={handleAccept}>
                ✓ &nbsp;Accept regulamentul
              </button>
            )}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '12px 32px',
            background: 'rgba(0,0,0,0.2)',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 8,
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.1)',
              textTransform: 'uppercase',
            }}>
              Departamentul Medical FPlayT
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
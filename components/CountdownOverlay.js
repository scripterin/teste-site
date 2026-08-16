'use client';

export default function CountdownOverlay({ count }) {
  if (count === null) return null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = count / 3;
  const dashoffset = circumference * (1 - progress);

  return (
    <>
      <style jsx global>{`
        .countdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(8, 4, 4, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: backdropIn 0.3s ease both;
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .countdown-ring-wrap {
          position: relative;
          width: 140px;
          height: 140px;
        }
        .countdown-ring-wrap svg { transform: rotate(-90deg); }
        .countdown-ring-track { stroke: rgba(255,59,78,0.12); fill: none; }
        .countdown-ring-fill {
          fill: none;
          stroke: #FF3B4E;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 10px rgba(255,59,78,0.6));
        }

        .countdown-num {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 52px;
          color: #fff;
        }
        .countdown-num-inner {
          animation: countPop 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes countPop {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .countdown-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(229,225,230,0.6);
          text-transform: uppercase;
          margin-top: 24px;
          text-align: center;
        }
      `}</style>

      <div className="countdown-backdrop">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="countdown-ring-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle className="countdown-ring-track" cx="70" cy="70" r={radius} strokeWidth="4" />
              <circle
                className="countdown-ring-fill"
                cx="70" cy="70" r={radius}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="countdown-num">
              <span key={count} className="countdown-num-inner">{count === 0 ? '' : count}</span>
            </div>
          </div>
          <p className="countdown-label">Se pregătește testul...</p>
        </div>
      </div>
    </>
  );
}
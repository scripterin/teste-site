'use client';

// ─── SVG Icons  ──────────────────────────────────
const IconRadio = ({ color = 'currentColor' }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="12" height="13" rx="2" />
    <path d="M9 8V3" />
    <path d="M9 11h6" />
    <path d="M9 14h6" />
    <path d="M9 17h3" />
    <path d="M15 8V6" />
  </svg>
);

const IconHeart = ({ color = 'currentColor' }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="6" rx="3" transform="rotate(-45 12 13)" />
    <path d="M12 13 L8.5 16.5" />
    <path d="M15.5 8 L18.5 11" />
    <path d="M17 9.5 L20 6.5" />
  </svg>
);

const IconHospital = ({ color = 'currentColor' }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18 L18 6 M6 18 L4 16 L14 6 L16 8 L6 18Z" />
    <path d="M14 6 L18 2 L22 6 L18 10 L14 6Z" fill={color} stroke="none" />
  </svg>
);

const IconAmbulance = ({ color = 'currentColor' }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="8" width="15" height="11" rx="1" />
    <path d="M16 10h4l3 3v4h-7V10z" />
    <circle cx="5.5" cy="19" r="1.5" />
    <circle cx="18.5" cy="19" r="1.5" />
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTS = [
  { id: 'RADIO', label: 'RADIO', Icon: IconRadio, color: '#00B4D8', colorRgb: '0, 180, 216', desc: 'Comunicații radio medicale' },
  { id: 'BLS', label: 'BLS', Icon: IconHeart, color: '#00B4D8', colorRgb: '0, 180, 216', desc: 'Basic Life Support' },
  { id: 'REZIDENȚIAT', label: 'REZIDENȚIAT', Icon: IconHospital, color: '#9B5DE5', colorRgb: '155, 93, 229', desc: 'Examen de rezidențiat' },
  { id: 'SMULS TEORETIC', label: 'SMULS TEORETIC', Icon: IconAmbulance, color: '#F77F00', colorRgb: '247, 127, 0', desc: 'Serviciu Medical Urgențe' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestButtons({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4">
      {TESTS.map((test) => {
        const isSelected = selected === test.id;
        return (
          <button
            key={test.id}
            onClick={() => onSelect(test.id)}
            className={`group relative flex flex-col items-center gap-3 p-8 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
              isSelected 
                ? 'bg-white/[0.08] backdrop-blur-md' 
                : 'bg-white/[0.02] backdrop-blur-sm border-white/5 hover:bg-white/[0.05] hover:border-white/10'
            }`}
            style={{
              borderColor: isSelected ? test.color : undefined,
              boxShadow: isSelected
                ? `0 0 30px rgba(${test.colorRgb}, 0.15), inset 0 0 20px rgba(${test.colorRgb}, 0.05)`
                : 'none',
            }}
          >
            {/* Background Glow Interior */}
            {isSelected && (
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20 pointer-events-none"
                style={{ background: test.color }}
              />
            )}

            {/* Icon cu efect de iluminare */}
            <div
              className="transition-all duration-500"
              style={{
                filter: isSelected
                  ? `drop-shadow(0 0 12px ${test.color})`
                  : 'grayscale(1) opacity(0.3)',
                transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              }}
            >
              <test.Icon color={isSelected ? test.color : 'white'} />
            </div>

            {/* Label */}
            <span
              className="font-display text-xl tracking-[0.2em] font-bold transition-colors duration-300"
              style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.2)' }}
            >
              {test.label}
            </span>

            {/* Descriere */}
            <span className={`font-body text-[10px] uppercase tracking-wider transition-opacity duration-300 ${
              isSelected ? 'opacity-40 text-white' : 'opacity-10 text-white'
            }`}>
              {test.desc}
            </span>

            {/* Indicator colț subtil */}
            {isSelected && (
              <div 
                className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full animate-ping"
                style={{ background: test.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
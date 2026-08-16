'use client';

const IconRadio = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="12" height="13" rx="2" />
    <path d="M9 8V3" /><path d="M9 11h6" /><path d="M9 14h6" /><path d="M9 17h3" /><path d="M15 8V6" />
  </svg>
);

const IconHeart = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconHospital = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M3 7v14m18-14v14M8 21V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M9 9h6M9 13h6M9 17h6" />
  </svg>
);

const IconAmbulance = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="8" width="15" height="11" rx="1" />
    <path d="M16 10h4l3 3v4h-7V10z" />
    <circle cx="5.5" cy="19" r="1.5" /><circle cx="18.5" cy="19" r="1.5" />
  </svg>
);

const TESTS = [
  { id: 'RADIO', label: 'RADIO', Icon: IconRadio },
  { id: 'BLS', label: 'BLS', Icon: IconHeart },
  { id: 'REZIDENȚIAT', label: 'REZIDENȚIAT', Icon: IconHospital },
  { id: 'SMULS TEORETIC', label: 'SMULS TEORETIC', Icon: IconAmbulance },
];

export default function TestButtons({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', width: '100%', maxWidth: '500px' }}>
      {TESTS.map((test) => {
        const isSelected = selected === test.id;
        return (
          <button
            key={test.id}
            onClick={() => onSelect(test.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px',
              padding: '13px 16px',
              borderRadius: '14px',
              background: isSelected
                ? 'linear-gradient(135deg, rgba(255,59,78,0.16) 0%, rgba(191,0,42,0.10) 100%)'
                : 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isSelected ? 'rgba(255,59,78,0.55)' : 'rgba(255,255,255,0.07)'}`,
              color: isSelected ? '#FF3B4E' : 'rgba(229,225,230,0.4)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: isSelected ? '0 4px 20px rgba(255,59,78,0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'rgba(255,59,78,0.3)';
                e.currentTarget.style.background = 'rgba(255,59,78,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#FF3B4E' : 'rgba(255,255,255,0.12)',
                flexShrink: 0,
                boxShadow: isSelected ? '0 0 8px #FF3B4E' : 'none',
                transition: 'all 0.25s ease',
              }}
            />
            <test.Icon color={isSelected ? '#FF3B4E' : 'rgba(229,225,230,0.35)'} />
            <span>{test.label}</span>
          </button>
        );
      })}
    </div>
  );
}
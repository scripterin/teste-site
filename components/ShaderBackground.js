'use client';

export default function ShaderBackground() {
  return (
    <>
      <style jsx global>{`
        @keyframes drift1 {
          0%   { transform: translate(-5%, -5%) scale(1); }
          50%  { transform: translate(8%, 6%) scale(1.15); }
          100% { transform: translate(-5%, -5%) scale(1); }
        }
        @keyframes drift2 {
          0%   { transform: translate(5%, 5%) scale(1); }
          50%  { transform: translate(-8%, -4%) scale(1.1); }
          100% { transform: translate(5%, 5%) scale(1); }
        }
        @keyframes drift3 {
          0%   { transform: translate(0%, 0%) scale(1); }
          50%  { transform: translate(-6%, 8%) scale(1.2); }
          100% { transform: translate(0%, 0%) scale(1); }
        }

        .shader-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: #0a0605;
        }

        .shader-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          will-change: transform;
        }

        .shader-blob-1 {
          width: 90vw; height: 90vw;
          top: -25vw; left: -15vw;
          background: radial-gradient(circle, rgba(230,45,50,0.85) 0%, rgba(150,20,25,0.35) 45%, transparent 72%);
          animation: drift1 18s ease-in-out infinite;
        }

        .shader-blob-2 {
          width: 75vw; height: 75vw;
          bottom: -20vw; right: -10vw;
          background: radial-gradient(circle, rgba(200,30,35,0.75) 0%, rgba(120,15,20,0.3) 45%, transparent 72%);
          animation: drift2 22s ease-in-out infinite;
        }

        .shader-blob-3 {
          width: 55vw; height: 55vw;
          top: 30%; left: 35%;
          background: radial-gradient(circle, rgba(255,80,70,0.55) 0%, rgba(120,15,20,0.2) 50%, transparent 75%);
          animation: drift3 15s ease-in-out infinite;
        }

        .shader-grain {
          position: absolute;
          inset: -50px;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          background-repeat: repeat;
        }
      `}</style>
      <div className="shader-bg">
        <div className="shader-blob shader-blob-1" />
        <div className="shader-blob shader-blob-2" />
        <div className="shader-blob shader-blob-3" />
        <div className="shader-grain" />
      </div>
    </>
  );
}
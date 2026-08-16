'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(syncSize);
      observer.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (uv - 0.5) * (u_resolution.x / u_resolution.y);

    vec3 color = vec3(0.039, 0.039, 0.051);

    float d1 = length(p - vec2(0.3 * sin(u_time * 0.5), 0.2 * cos(u_time * 0.7)));
    float blob1 = smoothstep(0.8, 0.0, d1);
    color = mix(color, vec3(1.0, 0.231, 0.306), blob1 * 0.6);

    float d2 = length(p - vec2(-0.4 * cos(u_time * 0.4), -0.3 * sin(u_time * 0.6)));
    float blob2 = smoothstep(0.9, 0.0, d2);
    color = mix(color, vec3(0.478, 0.059, 0.118), blob2 * 0.5);

    float d3 = length(p - vec2(0.5 * sin(u_time * 0.3), -0.5 * cos(u_time * 0.4)));
    float blob3 = smoothstep(0.7, 0.0, d3);
    color = mix(color, vec3(1.0, 0.231, 0.306), blob3 * 0.4);

    float noise = random(uv + fract(u_time)) * 0.04;
    color += noise;

    gl_FragColor = vec4(color, 1.0);
}`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let frameId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    }
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -2 }}
    />
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      signOut({ redirect: false }).then(() => {
        router.refresh();
      });
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 34, height: 34, border: '2px solid #FF3B4E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        html, body { margin: 0; background: #0A0A0D; overflow-x: hidden; }

        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .glass-card {
          background: rgba(15, 10, 10, 0.72);
          backdrop-filter: blur(32px) saturate(140%);
          -webkit-backdrop-filter: blur(32px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
          border-radius: 28px;
        }
 
        .btn-crimson {
          background: linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 8px 32px rgba(255,59,78,0.4);
        }
        .btn-crimson:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(255,59,78,0.6);
        }
        .btn-crimson::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-25deg);
          transition: all 0.5s ease;
        }
        .btn-crimson:hover::after { left: 200%; }

        .crimson-text {
          background: linear-gradient(135deg, #FF3B4E 0%, #bf002a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .crimson-glow { filter: drop-shadow(0 0 20px rgba(255,59,78,0.5)); }

        .card-fade { animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', top: '25%', left: -80, width: 384, height: 384, background: '#7A0F1E', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.5, mixBlendMode: 'screen', zIndex: -1 }} />
        <div style={{ position: 'absolute', bottom: '25%', right: -80, width: 400, height: 400, background: '#7A0F1E', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.35, mixBlendMode: 'screen', zIndex: -1 }} />
        <div className="grain-overlay" />

        <main style={{ width: '100%', maxWidth: 420, padding: '0 20px', zIndex: 2, position: 'relative' }}>
          <div className="glass-card card-fade" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            <div className="crimson-glow" style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(42,42,45,0.5)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF3B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
            </div>

            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.15em',
              color: '#E5BDBC',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Departament Medical
            </span>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#E5E1E6',
              margin: '0 0 16px',
            }}>
              Intră în <br /><span className="crimson-text">sistem</span>
            </h1>

            <p style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 15,
              lineHeight: 1.6,
              color: '#E5BDBC',
              maxWidth: 280,
              margin: '0 0 36px',
            }}>
              Autentificare securizată prin Discord pentru acces la certificările medicale.
            </p>

            <button
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              className="btn-crimson"
              style={{ width: '100%', borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, border: 'none', cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M19.2678 3.97825C17.7944 3.29824 16.2082 2.81223 14.5422 2.53622C14.5022 2.52922 14.4622 2.54822 14.4422 2.58522C14.2422 2.94223 14.0152 3.42224 13.8552 3.80225C12.0622 3.53524 10.2882 3.53524 8.52817 3.80225C8.36817 3.41524 8.13417 2.94223 7.93416 2.58522C7.91416 2.54822 7.87416 2.52922 7.83416 2.53622C6.16813 2.81223 4.58189 3.29824 3.10852 3.97825C3.09518 3.98525 3.08185 3.99825 3.07518 4.01825C0.0884631 8.48532 -0.311544 12.8394 0.195131 17.1335C0.195131 17.1535 0.208465 17.1665 0.221798 17.1795C2.2085 18.6395 4.12853 19.5265 6.00856 20.1265C6.04856 20.1395 6.09523 20.1265 6.11523 20.0865C6.56857 19.4665 6.9819 18.8135 7.34191 18.1205C7.36858 18.0675 7.34191 18.0075 7.28857 17.9875C6.66189 17.7475 6.06188 17.4675 5.48854 17.1475C5.42187 17.1145 5.4152 17.0205 5.4752 16.9805C5.59521 16.8875 5.71521 16.7945 5.82854 16.6945C5.86188 16.6675 5.90855 16.6605 5.95521 16.6805C9.91528 18.4875 14.4954 18.4875 18.4154 16.6805C18.4621 16.6605 18.5154 16.6675 18.5488 16.6945C18.6621 16.7945 18.7821 16.8945 18.9021 16.9805C18.9621 17.0275 18.9554 17.1145 18.8954 17.1475C18.3221 17.4745 17.7221 17.7545 17.0954 17.9875C17.0421 18.0075 17.0154 18.0675 17.0421 18.1205C17.4088 18.8135 17.8221 19.4595 18.2621 20.0865C18.2888 20.1265 18.3354 20.1395 18.3754 20.1265C20.2621 19.5265 22.1822 18.6395 24.1688 17.1795C24.1822 17.1665 24.1888 17.1465 24.1888 17.1335C24.7888 12.2464 23.8688 7.91831 21.3021 4.01825C21.2888 3.99825 21.2755 3.98525 21.2621 3.97825H19.2678ZM8.01416 14.1675C6.91414 14.1675 6.00813 13.1675 6.00813 11.9404C6.00813 10.7134 6.88748 9.71343 8.01416 9.71343C9.15418 9.71343 10.0602 10.7264 10.0335 11.9404C10.0335 13.1675 9.14085 14.1675 8.01416 14.1675ZM16.3476 14.1675C15.2476 14.1675 14.3416 13.1675 14.3416 11.9404C14.3416 10.7134 15.2209 9.71343 16.3476 9.71343C17.4876 9.71343 18.3937 10.7264 18.367 11.9404C18.367 13.1675 17.4876 14.1675 16.3476 14.1675Z" />
              </svg>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: '#fff' }}>
                Conectare prin Discord
              </span>
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
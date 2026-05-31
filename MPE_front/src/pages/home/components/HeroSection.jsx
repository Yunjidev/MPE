import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../../store/user";

/* ─── hex grid constants ─────────────────────────────────────────── */
const S    = 38;                        // circumradius (flat-top hexagon)
const COLS = 15;
const ROWS = 10;
const CW   = S * 1.5;                  // column step
const RH   = S * Math.sqrt(3);         // row step
const W    = COLS * CW + S;
const H    = ROWS * RH + S;
const DIAG = Math.hypot(W, H);
const HOVER_R = 115;                   // spotlight radius (px)

/* precompute hex centres + cascade delay (0 = top-right, max = bottom-left) */
const HEXES = (() => {
  const list = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const cx = c * CW + S;
      const cy = r * RH + (c % 2 ? RH / 2 : 0) + RH / 2;
      const dc = (COLS - 1 - c) / (COLS - 1);   // 0 = rightmost → 1 = leftmost
      const dr = r / (ROWS - 1);                 // 0 = topmost  → 1 = bottommost
      list.push({ id: `${c},${r}`, cx, cy, delay: (Math.hypot(dc, dr) / Math.SQRT2) * 0.9 });
    }
  }
  return list;
})();

function hexPts(cx, cy) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + (S - 2) * Math.cos(a)).toFixed(1)},${(cy + (S - 2) * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/* ─── hex overlay ────────────────────────────────────────────────── */
function HexGrid() {
  const svgRef = useRef(null);
  const [mouse, setMouse] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      const b = svg.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      setMouse(x >= 0 && x <= b.width && y >= 0 && y <= b.height ? { x, y } : null);
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="absolute top-0 right-0 pointer-events-none select-none hidden lg:block"
      aria-hidden="true"
    >
      <defs>
        {/* radial fade mask: opaque at top-right corner, transparent toward bottom-left */}
        <radialGradient id="hexFade" cx={W} cy={0} r={DIAG} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="white" stopOpacity="1" />
          <stop offset="50%"  stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="hexMask">
          <rect width={W} height={H} fill="url(#hexFade)" />
        </mask>
        <style>{`
          @keyframes hexIn {
            from { opacity: 0; transform-box: fill-box; transform: scale(0.4); }
            to   { opacity: 1; transform-box: fill-box; transform: scale(1);   }
          }
        `}</style>
      </defs>

      <g mask="url(#hexMask)">
        {HEXES.map(({ id, cx, cy, delay }) => {
          const d = mouse ? Math.hypot(cx - mouse.x, cy - mouse.y) : Infinity;
          const t = d < HOVER_R ? (1 - d / HOVER_R) ** 2 : 0;
          return (
            <polygon
              key={id}
              points={hexPts(cx, cy)}
              fill={`rgba(19,42,36,${(t * 0.16).toFixed(4)})`}
              stroke="rgba(19,42,36,0.08)"
              strokeWidth={1}
              style={{
                animation: `hexIn .45s cubic-bezier(.22,1,.36,1) ${delay.toFixed(2)}s both`,
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ─── hero section ───────────────────────────────────────────────── */
export default function HeroSection() {
  const [user] = useAtom(userAtom);

  return (
    <section className="w-full pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40 relative overflow-hidden">

      {/* Gradient blobs */}
      <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-[#c8dbd2] rounded-full blur-[100px] -z-10 animate-[gradientFlow1_8s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-[#b9cfc5] rounded-full blur-[100px] -z-10 animate-[gradientFlow2_10s_ease-in-out_infinite]" />

      {/* Honeycomb overlay */}
      <HexGrid />

      <div className="px-6 sm:px-12 lg:pl-24 lg:pr-16 max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

          {/* ── Left ── */}
          {/* MODIFICATION : Élargissement de la max-width pour donner de l'air au titre */}
          <div className="w-full lg:max-w-4xl xl:max-w-5xl min-w-0">

            <p
              className="text-sm font-light tracking-widest text-[#879f98] uppercase opacity-0 animate-[blurFadeUp_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
              style={{ animationDelay: "0ms" }}
            >
              Pour les particuliers et les professionnels
            </p>

            {/* MODIFICATION : Changement de la structure pour forcer les deux lignes distinctes */}
            <h1
              className="mt-8 sm:mt-12 font-light text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-[#132A24] to-[#4b8a74] opacity-0 animate-[blurFadeUp_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
              style={{ animationDelay: "120ms" }}
            >
              <span className="block">Trouvez un professionnel ou</span>
              <span className="block">développez votre visibilité locale</span>
            </h1>

            <p
              className="max-w-lg mt-6 sm:mt-10 text-xl font-thin text-[#4b615a] leading-relaxed tracking-tight opacity-0 animate-[blurFadeUp_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
              style={{ animationDelay: "260ms" }}
            >
              Proxilio aide les entreprises à développer leur visibilité et les particuliers à trouver des pros de confiance près de chez eux.
            </p>

            <div
              className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10 sm:mt-14 opacity-0 animate-[blurFadeUp_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
              style={{ animationDelay: "380ms" }}
            >
              <div className="relative inline-flex items-center justify-center group">
                <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-[#132A24] to-[#4b8a74] group-hover:shadow-lg group-hover:shadow-[#132A24]/30" />
                <Link
                  to="/professionnels"
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-light text-[#132A24] bg-[#f5f7f6] border border-transparent rounded-full tracking-tight hover:bg-[#eef5f1] transition-colors"
                >
                  Rechercher un pro
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              <Link
                to={user.isLogged ? "/dashboard/user-db" : "/signup"}
                className="text-sm font-light text-[#4b615a] hover:text-[#132A24] transition-colors tracking-tight underline underline-offset-4 decoration-[#132A24]/20 hover:decoration-[#132A24]"
              >
                {user.isLogged ? "Mon dashboard →" : "S'inscrire gratuitement →"}
              </Link>
            </div>

          </div>

          {/* ── Right : logo ── */}
          {/* MODIFICATION : Augmentation drastique de la taille du logo sur desktop */}
          <div
            className="flex-1 flex items-center justify-center lg:justify-start shrink-0 opacity-0 animate-[blurFadeUp_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "300ms" }}
          >
            <img
              src="/assets/img/logo.png"
              alt="Proxilio"
              className="w-80 sm:w-[460px] lg:w-[680px] xl:w-[780px] object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
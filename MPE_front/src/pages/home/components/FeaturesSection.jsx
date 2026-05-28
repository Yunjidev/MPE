/* eslint-disable react/prop-types */

const FEATURES = [
  {
    col: "lg:col-span-6",
    dark: false,
    title: "Entreprises vérifiées",
    desc: "Chaque professionnel est validé manuellement avant son apparition sur la plateforme.",
    visual: (
      <div className="absolute bottom-0 left-0 w-full h-[220px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#879f9815_1px,transparent_1px),linear-gradient(to_bottom,#879f9815_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] pointer-events-none" />
        <div className="relative flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
          <div className="absolute -top-10 -left-12 w-12 h-12 bg-gradient-to-br from-[#eef3f0] to-[#dce7e2] rounded-xl shadow-sm opacity-80 animate-[float_4s_ease-in-out_infinite]" />
          <div className="absolute top-6 -right-16 w-14 h-14 bg-[#132A24]/5 rounded-2xl shadow-sm opacity-80 animate-[float_5s_ease-in-out_infinite_0.5s]" />
          <div className="absolute -bottom-6 -left-8 w-10 h-10 bg-[#879f98]/15 rounded-lg shadow-sm opacity-80 animate-[float_6s_ease-in-out_infinite_1s]" />
          <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-3xl bg-white border border-black/5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.10)] flex items-center justify-center text-[#132A24] relative z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#eef3f0]/50 rounded-3xl" />
            <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    col: "lg:col-span-6",
    dark: false,
    title: "Avis authentiques",
    desc: "Seuls les clients ayant effectué une réservation peuvent publier un avis.",
    visual: (
      <div className="absolute bottom-0 left-0 w-full h-[220px] flex items-center justify-center pointer-events-none translate-y-2">
        <div className="relative flex items-center justify-center transition-transform duration-700 group-hover:scale-105 pointer-events-auto">
          {/* Orbital rings */}
          <div className="absolute w-32 h-32 border border-[#132A24]/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-52 h-52 border border-[#132A24]/12 rounded-full border-dashed animate-[spin_32s_linear_infinite_reverse]" />
          <div className="absolute w-72 h-72 border border-[#132A24]/8 rounded-full animate-[spin_48s_linear_infinite]" />

          {/* Orbital nodes — 2 stars + 1 check + 1 shield */}
          {[
            { x: 0, y: -64, kind: "star" },
            { x: 64, y: 0, kind: "check" },
            { x: 0, y: 64, kind: "star" },
            { x: -64, y: 0, kind: "shield" },
          ].map(({ x, y, kind }, i) => (
            <div key={i}
              className="absolute w-10 h-10 bg-white border border-black/5 rounded-full shadow-sm flex items-center justify-center text-[#132A24] animate-[float_5s_ease-in-out_infinite]"
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, animationDelay: `${i * 0.6}s` }}>
              {kind === "star" && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {kind === "check" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {kind === "shield" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              )}
            </div>
          ))}

          {/* Center hub */}
          <div className="w-20 h-20 rounded-full shadow-[0_12px_40px_-10px_rgba(19,42,36,0.15)] flex items-center justify-center z-20 relative overflow-visible">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#eef5f1] to-white border border-[#132A24]/15 group-hover:from-[#132A24] group-hover:to-[#274F44] group-hover:border-transparent transition-all duration-500" />
            <img
              src="/assets/img/logo.png"
              alt="MPE"
              className="w-10 h-10 object-contain relative z-10 transition-all duration-500 group-hover:brightness-0 group-hover:invert"
            />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#132A24] rounded-full flex items-center justify-center z-30 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    col: "lg:col-span-5",
    dark: false,
    title: "Recherche locale intelligente",
    desc: "Recherchez par métier, ville ou distance pour trouver les meilleurs professionnels autour de vous.",
    visual: (
      <div className="absolute bottom-0 left-0 w-full h-[220px] flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center transition-transform duration-700 group-hover:scale-105">
          <div className="w-64 h-20 bg-white rounded-2xl border border-black/5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] flex items-center justify-between px-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E3EAE6] border border-[#132A24]/10 flex items-center justify-center text-[#132A24]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-bold">Autour de vous</div>
                <div className="text-sm text-[#132A24] font-medium tracking-tight">Lille, 59</div>
              </div>
            </div>
            <div className="text-[#132A24] bg-[#E3EAE6] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#132A24]/15">
              5 km
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
            <div className="w-52 h-52 border border-[#132A24]/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    col: "lg:col-span-7",
    dark: true,
    title: "Réservation en ligne",
    desc: "Prenez rendez-vous directement avec les entreprises Premium grâce au calendrier intégré.",
    visual: (
      <div className="absolute bottom-0 left-0 w-full h-[220px] flex items-end justify-center px-10">
        <div className="relative w-full max-w-sm h-[160px] flex items-end justify-between transition-transform duration-700 group-hover:scale-105 z-10 origin-bottom">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="chart-grad-dark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A563D" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1A563D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q25,40 50,60 T100,10 L100,100 L0,100 Z" fill="url(#chart-grad-dark)" />
            <path d="M0,80 Q25,40 50,60 T100,10" fill="none" stroke="#1A563D" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          {[{h:12,pct:"+12%",v:false},{h:20,pct:"+28%",v:false},{h:28,pct:"+41%",v:false},{h:40,pct:"+67%",v:true}].map((b,i) => (
            <div key={i} className="relative flex flex-col items-center gap-2">
              <div className={`text-xs font-bold px-2 py-0.5 rounded ${b.v ? "bg-[#1A563D] text-white" : "text-[#879f98] bg-white/5 backdrop-blur-sm"}`}>{b.pct}</div>
              <div className={`w-10 sm:w-14 rounded-t-xl border-t ${b.v ? "bg-gradient-to-t from-[#1A563D]/10 to-[#1A563D]/40 border-[#1A563D]" : "bg-white/5 backdrop-blur-sm border-white/10"}`}
                style={{ height:`${b.h * 4}px` }}>
                <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#132A24] ${b.v ? "bg-[#1A563D] shadow-[0_0_10px_rgba(26,86,61,0.5)]" : "bg-[#1A563D]"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-40 w-full border-t border-black/5 overflow-hidden">
      <div className="text-center mb-12 sm:mb-28 rv-blur">
        <p className="text-sm uppercase tracking-widest text-[#879f98] mb-8 font-light flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-[#879f98]" /> FONCTIONNALITÉS <span className="w-6 h-px bg-[#879f98]" />
        </p>
        <h2 className="font-light text-[40px] sm:text-[64px] leading-tight text-[#132A24] tracking-tight mb-6 sm:mb-10">
          Trouvez un professionnel en toute{" "}
          <span className="text-[#274F44]">confiance.</span>
        </h2>
        <p className="text-base sm:text-2xl text-[#4b615a] font-light max-w-4xl mx-auto leading-relaxed tracking-tight">
          Chaque fonctionnalité a été pensée pour vous aider à trouver rapidement des entreprises fiables près de chez vous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
        {FEATURES.map((f, i) => (
          <div key={i}
            className={`group ${f.col} rounded-[2rem] p-8 sm:p-10 border flex flex-col h-[400px] sm:h-[420px]
              shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl
              rv-up rv-d${i + 1} cursor-pointer overflow-hidden relative
              ${f.dark
                ? "bg-[#132A24] border-transparent shadow-[0_12px_40px_-12px_rgba(19,42,36,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(19,42,36,0.6)]"
                : "bg-white border-black/5"}`}>
            <div className="relative z-20 mb-8 max-w-md">
              <h3 className={`font-light text-2xl sm:text-4xl tracking-tight mb-2 sm:mb-4 transition-colors ${f.dark ? "text-white" : "text-[#132A24] group-hover:text-[#274F44]"}`}>
                {f.title}
              </h3>
              <p className={`text-sm sm:text-xl font-light leading-relaxed tracking-tight ${f.dark ? "text-[#879f98] group-hover:text-[#c8dbd2] transition-colors" : "text-[#4b615a]"}`}>
                {f.desc}
              </p>
            </div>
            {f.visual}
          </div>
        ))}
      </div>
    </section>
  );
}

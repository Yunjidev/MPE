/* eslint-disable react/prop-types */

const STAT_ICONS = {
  users:     "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  work:      "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
  building:  "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  premium:   "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z",
};

export default function StatsSection({ stats }) {
  const rows = [
    { label: "Utilisateurs",       value: stats.userLength,              icon: STAT_ICONS.users },
    { label: "Entrepreneurs",      value: stats.entrepreneurLength,      icon: STAT_ICONS.work },
    { label: "Entreprises",        value: stats.enterpriseLength,        icon: STAT_ICONS.building },
    { label: "Entreprises Premium",value: stats.premiumEnterpriseLength, icon: STAT_ICONS.premium },
  ];

  return (
    <section className="w-full py-16 sm:py-40 border-t border-black/5 overflow-hidden">
      <div className="px-4 sm:px-8 lg:px-16 w-full">
        <div className="mb-16 sm:mb-20 rv-blur max-w-[1400px] mx-auto">
          <p className="text-sm uppercase tracking-widest text-[#879f98] mb-6 font-light flex items-center gap-2">
            <span className="w-6 h-px bg-[#879f98]" /> CHIFFRES
          </p>
          <h2 className="font-light text-[40px] sm:text-[64px] leading-tight text-[#132A24] tracking-tight">
            Proxilio en chiffres.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border border-black/5 rounded-[2rem] overflow-hidden max-w-[1400px] mx-auto bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          {rows.map((s, i) => (
            <div key={i}
              className={`flex flex-col items-center justify-center p-8 sm:p-12 rv-up rv-d${i + 1}
                ${i < 3 ? "border-r border-black/5" : ""}
                ${i < 2 ? "border-b border-black/5 lg:border-b-0" : ""}`}>
              <svg className="w-8 h-8 text-[#879f98] mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
              <dd className="text-4xl sm:text-5xl font-light text-[#132A24] tracking-tight mb-2">{s.value}</dd>
              <dt className="text-xs text-[#879f98] uppercase tracking-widest font-light text-center">{s.label}</dt>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    title: "Mise en avant sur l'accueil",
    desc: "Votre entreprise est affichée en priorité sur la page d'accueil, visible par tous les visiteurs avant même qu'ils lancent une recherche.",
  },
  {
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z",
    title: "Priorisation dans les recherches",
    desc: "Votre entreprise remonte en tête des résultats. Les clients potentiels vous trouvent en premier, avant vos concurrents.",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z",
    title: "Badge de certification",
    desc: "Un badge officiel affiché sur votre profil renforce votre crédibilité et inspire confiance aux clients.",
  },
  {
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    title: "Calendrier & Réservations",
    desc: "Gérez vos disponibilités et recevez des réservations directement depuis votre profil, 24h/24.",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "Statistiques détaillées",
    desc: "Suivez vos réservations et l'évolution de votre activité grâce à un tableau de bord complet.",
  },
];

const PLANS = [
  {
    key: null,
    name: "Basique",
    price: "0 €",
    period: "",
    desc: "Pour créer votre présence et démarrer.",
    badge: null,
    dark: false,
    features: ["Page entreprise", "Dashboard", "Statistiques de base"],
    cta: null,
  },
  {
    key: "monthly",
    name: "Mensuel",
    price: "10 €",
    period: "/mois",
    desc: "Accès complet, sans engagement.",
    badge: "Populaire",
    dark: false,
    features: ["Tout le Basique", "Mise en avant accueil", "Badge certification", "Réservations en ligne", "Statistiques avancées", "Création de devis"],
    cta: "/subscribe?plan=monthly",
  },
  {
    key: "yearly",
    name: "Annuel",
    price: "100 €",
    period: "/an",
    desc: "Le meilleur rapport qualité/prix.",
    badge: "2 mois offerts",
    dark: true,
    features: ["Tout le Mensuel", "Priorité maximale", "Support prioritaire"],
    cta: "/subscribe?plan=yearly",
  },
];

const TABLE_ROWS = [
  { name: "Page d'entreprise",            b: true,  m: true,  a: true  },
  { name: "Dashboard entreprise",         b: true,  m: true,  a: true  },
  { name: "Statistiques de base",         b: true,  m: true,  a: true  },
  { name: "Statistiques avancées",        b: false, m: true,  a: true  },
  { name: "Mise en avant sur l'accueil",  b: false, m: true,  a: true  },
  { name: "Priorisation des recherches",  b: false, m: true,  a: true  },
  { name: "Badge de certification",       b: false, m: true,  a: true  },
  { name: "Calendrier & Réservations",    b: false, m: true,  a: true  },
  { name: "Support prioritaire",          b: false, m: false, a: true  },
];

function Check({ ok }) {
  if (ok) return (
    <div className="mx-auto w-5 h-5 rounded-full bg-[#eef5f1] flex items-center justify-center">
      <svg className="w-3 h-3 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );
  return <div className="mx-auto w-1 h-px bg-[#132A24]/15 mt-2.5" />;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [mobileCol, setMobileCol] = useState("m");

  return (
    <div className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-24 w-full space-y-20 sm:space-y-32">

      {/* ── Hero ── */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-light text-[40px] sm:text-[56px] leading-tight tracking-tight text-[#132A24] mb-6">
          Développez votre activité<br />
          <span className="text-[#274F44]">au niveau supérieur.</span>
        </h1>
        <p className="text-base sm:text-xl text-[#4b615a] font-light leading-relaxed tracking-tight">
          Avec Proxilio Premium, votre entreprise gagne en visibilité, en crédibilité et dispose de tous les outils pour attirer de nouveaux clients.
        </p>
      </div>

      {/* ── Features ── */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-8 flex items-center gap-2">
          <span className="w-6 h-px bg-[#879f98]" /> FONCTIONNALITÉS PREMIUM
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.slice(0, 3).map((f, i) => (
            <div key={i} className="bg-white border border-black/5 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center text-[#132A24]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-[#132A24] font-light text-base tracking-tight mb-1.5">{f.title}</h3>
                <p className="text-[#4b615a] text-sm font-light leading-relaxed tracking-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 lg:w-2/3 mx-auto">
          {FEATURES.slice(3).map((f, i) => (
            <div key={i} className="bg-white border border-black/5 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center text-[#132A24]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-[#132A24] font-light text-base tracking-tight mb-1.5">{f.title}</h3>
                <p className="text-[#4b615a] text-sm font-light leading-relaxed tracking-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plans ── */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-8 flex items-center gap-2">
          <span className="w-6 h-px bg-[#879f98]" /> NOS FORMULES
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`rounded-[1.5rem] border p-7 flex flex-col gap-6 relative
                ${plan.dark
                  ? "bg-[#132A24] border-transparent shadow-[0_12px_40px_-12px_rgba(19,42,36,0.5)]"
                  : "bg-white border-black/5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]"
                }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-6 text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide
                  ${plan.dark ? "bg-white text-[#132A24]" : "bg-[#132A24] text-white"}`}>
                  {plan.badge}
                </span>
              )}
              <div>
                <p className={`text-[10px] uppercase tracking-widest font-light mb-3 ${plan.dark ? "text-[#879f98]" : "text-[#879f98]"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-4xl font-light tracking-tight ${plan.dark ? "text-white" : "text-[#132A24]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1 font-light ${plan.dark ? "text-[#879f98]" : "text-[#879f98]"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm font-light tracking-tight ${plan.dark ? "text-[#879f98]" : "text-[#4b615a]"}`}>
                  {plan.desc}
                </p>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm font-light tracking-tight">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.dark ? "bg-white/10" : "bg-[#eef5f1]"}`}>
                      <svg className={`w-2.5 h-2.5 ${plan.dark ? "text-white" : "text-[#132A24]"}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className={plan.dark ? "text-white/80" : "text-[#4b615a]"}>{feat}</span>
                  </li>
                ))}
              </ul>
              {plan.cta ? (
                <Link
                  to={plan.cta}
                  className={`w-full py-3 rounded-full text-sm font-light tracking-tight text-center transition-all duration-300 hover:-translate-y-0.5
                    ${plan.dark
                      ? "bg-white text-[#132A24] hover:shadow-lg"
                      : "bg-[#132A24] text-white hover:bg-[#1b3b33] hover:shadow-lg"
                    }`}
                >
                  Souscrire
                </Link>
              ) : (
                <div className="w-full py-3 rounded-full text-sm font-light tracking-tight text-center text-[#879f98] bg-[#f5f7f6] border border-black/5">
                  Gratuit
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-black/5 rounded-[1.5rem] overflow-hidden shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          {/* Mobile selector */}
          <div className="sm:hidden px-6 py-4 border-b border-black/5 flex items-center gap-3">
            <span className="text-xs text-[#879f98] font-light uppercase tracking-widest">Comparer :</span>
            <select
              value={mobileCol}
              onChange={(e) => setMobileCol(e.target.value)}
              className="bg-[#f5f7f6] border border-black/5 text-[#132A24] text-sm rounded-xl px-3 py-1.5 font-light focus:outline-none"
            >
              <option value="b">Basique</option>
              <option value="m">Mensuel</option>
              <option value="a">Annuel</option>
            </select>
          </div>

          {/* Header */}
          <div className="hidden sm:grid grid-cols-4 px-6 py-5 border-b border-black/5 bg-[#f5f7f6]">
            <div />
            {["Basique", "Mensuel", "Annuel"].map((label) => (
              <div key={label} className="text-center text-xs font-light uppercase tracking-widest text-[#879f98]">{label}</div>
            ))}
          </div>

          {/* Rows */}
          {TABLE_ROWS.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-2 sm:grid-cols-4 px-6 py-4 items-center ${idx < TABLE_ROWS.length - 1 ? "border-b border-black/5" : ""} ${idx % 2 === 0 ? "bg-white" : "bg-[#f5f7f6]/40"}`}
            >
              <span className="text-sm text-[#132A24] font-light tracking-tight">{row.name}</span>
              <div className="hidden sm:flex justify-center"><Check ok={row.b} /></div>
              <div className="hidden sm:flex justify-center"><Check ok={row.m} /></div>
              <div className="hidden sm:flex justify-center"><Check ok={row.a} /></div>
              <div className="flex sm:hidden justify-center">
                <Check ok={mobileCol === "b" ? row.b : mobileCol === "m" ? row.m : row.a} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-[#132A24] rounded-[2rem] px-8 sm:px-16 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="font-light text-2xl sm:text-4xl text-white tracking-tight mb-3">
            Prêt à développer<br />votre activité ?
          </h2>
          <p className="text-[#879f98] font-light text-sm sm:text-base tracking-tight">
            Rejoignez les professionnels qui font confiance à Proxilio.
          </p>
        </div>
        <button
          onClick={() => navigate("/subscribe")}
          className="group shrink-0 bg-white text-[#132A24] px-8 py-4 rounded-full text-sm sm:text-base font-light tracking-tight flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          Passer Premium
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}

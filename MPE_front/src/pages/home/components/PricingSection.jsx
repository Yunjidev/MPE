/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Basique",
    price: "0€", label: "/mois",
    color: "text-white",
    border: "border-white/10",
    features: ["Créer son entreprise","Page d'entreprise","Statistiques","Dashboard"],
    btn: "Commencer gratuitement", to: "/signup",
    btnStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/15",
  },
  {
    name: "Mensuel",
    price: "30€", label: "/mois",
    color: "text-[#ea580c]",
    border: "border-[#ea580c]/40",
    features: ["Tout le Basique","Mise en avant accueil","Priorisation recherches","Calendrier & réservations"],
    btn: "Passer Premium", to: "/subscribe?plan=monthly",
    btnStyle: "bg-[#ea580c] hover:bg-[#274F44] text-white shadow-lg",
  },
  {
    name: "Annuel",
    price: "270€", label: "/an",
    color: "text-[#879f98]",
    border: "border-white/10",
    features: ["Tout le Premium","3 mois offerts","Meilleur rapport qualité/prix"],
    btn: "Passer Premium Annuel", to: "/subscribe?plan=yearly",
    btnStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/15",
  },
];

export default function PricingSection() {
  return (
    <section className="w-full bg-[#132A24] py-16 sm:py-40">
      <div className="w-full px-4 sm:px-8 lg:px-16 2xl:px-24 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-start">

        {/* Left sticky header */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-36 rv-blur">
          <h2 className="font-light text-[40px] sm:text-[64px] leading-tight text-white tracking-tight mb-6 sm:mb-10">
            Vous êtes<br />
            <span className="text-[#ea580c]">entrepreneur ?</span>
          </h2>
          <div className="text-[#879f98] text-base sm:text-2xl font-light leading-relaxed space-y-6 max-w-lg tracking-tight">
            <p>
              Inscrivez votre entreprise gratuitement et touchez de nouveaux clients locaux dès aujourd'hui.
            </p>
            <p>
              Passez Premium pour booster votre visibilité, activer les réservations et obtenir un badge de certification.
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="lg:col-span-7 rv-up rv-d2">
          <div className="bg-[#173028] border border-white/5 rounded-[2rem] p-4 sm:p-10 shadow-2xl w-full transition-transform duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                <div key={i} className={`rounded-2xl border ${plan.border} bg-white/5 p-6 flex flex-col gap-5`}>
                  <div>
                    <p className={`text-xl font-semibold tracking-tight ${plan.color}`}>{plan.name}</p>
                    <p className="text-3xl font-light text-white mt-1 tracking-tight">
                      {plan.price}<span className="text-sm text-[#879f98]">{plan.label}</span>
                    </p>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-[#879f98] font-light">
                        <svg className="w-4 h-4 text-[#ea580c] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.to}
                    className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 ${plan.btnStyle}`}
                  >
                    {plan.btn}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/pricing" className="text-sm text-[#879f98] hover:text-[#ea580c] transition-colors font-light underline underline-offset-4 decoration-white/10 hover:decoration-[#ea580c]/40">
                Voir toutes les fonctionnalités →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

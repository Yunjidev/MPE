import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getData, postData } from "../../services/data-fetch";

const PLANS = [
  {
    key: "monthly",
    label: "Mensuel",
    price: "30 €",
    period: "/mois",
    desc: "Facturation mensuelle, résiliable à tout moment.",
    badge: null,
  },
  {
    key: "yearly",
    label: "Annuel",
    price: "270 €",
    period: "/an",
    desc: "3 mois offerts par rapport au mensuel.",
    badge: "Économisez 90 €",
  },
];

const PREMIUM_FEATURES = [
  "Mise en avant sur la page d'accueil",
  "Priorité dans les résultats de recherche",
  "Badge de certification vérifié",
  "Calendrier de réservation en ligne",
  "Statistiques et suivi des performances",
  "Support prioritaire",
];

export default function SubscribePage() {
  const [searchParams] = useSearchParams();

  const [allEnterprises, setAllEnterprises] = useState([]);
  const [eligibleEnterprises, setEligibleEnterprises] = useState([]);
  const [fetchingEnterprises, setFetchingEnterprises] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getData("user/enterprises")
      .then((data) => {
        setAllEnterprises(data);
        const eligible = data.filter((e) => !e.isPremium);
        setEligibleEnterprises(eligible);
        const eid = searchParams.get("enterpriseId");
        if (eid && eligible.some((e) => String(e.id) === eid)) {
          setSelectedEnterprise(eid);
        } else if (eligible.length > 0) {
          setSelectedEnterprise(String(eligible[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setFetchingEnterprises(false));
  }, []);

  const handleCheckout = async () => {
    if (!selectedEnterprise) {
      setError("Veuillez sélectionner une entreprise.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await postData("stripe/create-checkout-session", {
        plan: selectedPlan,
        enterprise_id: parseInt(selectedEnterprise),
      });
      window.location.href = data.url;
    } catch (err) {
      const parsed = JSON.parse(err.message || "{}");
      setError(parsed.error || "Une erreur est survenue. Vérifiez que la clé Stripe est configurée.");
      setLoading(false);
    }
  };

  const activePlan = PLANS.find((p) => p.key === selectedPlan);
  const selectedEnterpriseName = allEnterprises.find((e) => String(e.id) === selectedEnterprise)?.name;

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-24 flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* ── Left — Description Premium ── */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#879f98]" /> PASSER PREMIUM
            </p>
            <h1 className="font-light text-[40px] sm:text-[52px] leading-tight tracking-tight text-[#132A24] mb-6">
              Boostez votre<br />
              <span className="text-[#274F44]">visibilité locale.</span>
            </h1>
            <p className="text-base sm:text-xl text-[#4b615a] font-light leading-relaxed tracking-tight max-w-md">
              Passez en Premium pour débloquer toutes les fonctionnalités et vous démarquer auprès des clients proches de vous.
            </p>
          </div>

          {/* Features list */}
          <div className="flex flex-col gap-3">
            {PREMIUM_FEATURES.map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-sm text-[#4b615a] font-light tracking-tight">{feat}</span>
              </div>
            ))}
          </div>

          {/* Trust note */}
          <div className="flex items-center gap-3 pt-2">
            <svg className="w-4 h-4 text-[#879f98] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-xs text-[#879f98] font-light tracking-tight">
              Paiement 100 % sécurisé via Stripe. Aucune donnée bancaire stockée sur nos serveurs.
            </p>
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div className="bg-white border border-black/5 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col gap-7">

          {/* Enterprise selector */}
          {fetchingEnterprises && (
            <div className="flex items-center gap-3 text-[#879f98] text-sm font-light">
              <svg className="animate-spin h-4 w-4 text-[#132A24]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Vérification de vos entreprises…
            </div>
          )}

          {!fetchingEnterprises && allEnterprises.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#eef5f1] border border-[#132A24]/10 text-[#4b615a] text-sm font-light">
              Vous n'avez aucune entreprise enregistrée. Créez-en une depuis votre dashboard.
            </div>
          )}

          {!fetchingEnterprises && eligibleEnterprises.length === 0 && allEnterprises.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#eef5f1] border border-[#132A24]/10 text-[#4b615a] text-sm font-light">
              Toutes vos entreprises bénéficient déjà du statut Premium.
            </div>
          )}

          {eligibleEnterprises.length > 1 && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2.5">
                Entreprise concernée
              </label>
              <select
                value={selectedEnterprise}
                onChange={(e) => setSelectedEnterprise(e.target.value)}
                className="w-full bg-[#f5f7f6] border border-black/5 text-[#132A24] rounded-2xl px-4 py-3 text-sm font-light focus:outline-none focus:ring-1 focus:ring-[#132A24]/20 tracking-tight appearance-none"
              >
                {eligibleEnterprises.map((e) => (
                  <option key={e.id} value={String(e.id)}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plan selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2.5">
              Formule
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const active = selectedPlan === plan.key;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`relative text-left rounded-2xl border p-4 transition-all duration-200 ${
                      active
                        ? "border-[#132A24] bg-[#eef5f1]"
                        : "border-black/5 bg-[#f5f7f6] hover:border-[#132A24]/30"
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#132A24] text-white tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                    <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${active ? "text-[#132A24]" : "text-[#879f98]"}`}>
                      {plan.label}
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-2xl font-light tracking-tight ${active ? "text-[#132A24]" : "text-[#132A24]/60"}`}>{plan.price}</span>
                      <span className="text-[#879f98] text-xs mb-0.5 font-light">{plan.period}</span>
                    </div>
                    <p className="text-[#879f98] text-xs font-light leading-snug">{plan.desc}</p>
                    <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      active ? "border-[#132A24] bg-[#132A24]" : "border-[#132A24]/20"
                    }`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-[#f5f7f6] border border-black/5 px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-[#4b615a] font-light tracking-tight">
              {selectedEnterpriseName || "—"} — {activePlan?.label}
            </span>
            <span className="text-sm font-light text-[#132A24] tracking-tight">
              {activePlan?.price}<span className="text-[#879f98]">{activePlan?.period}</span>
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm font-light">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading || fetchingEnterprises || eligibleEnterprises.length === 0}
            className="group w-full py-4 rounded-full bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-base tracking-tight transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Redirection vers Stripe…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payer avec Stripe
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

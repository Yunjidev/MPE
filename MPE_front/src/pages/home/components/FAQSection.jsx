import { useState } from "react";

const FAQS = [
  {
    q: "Qu'est-ce que Proxilio ?",
    a: "Proxilio est une plateforme qui met en relation des particuliers avec des professionnels locaux vérifiés. Chaque entreprise est validée manuellement par notre équipe avant d'apparaître sur la plateforme, garantissant ainsi la fiabilité des prestataires.",
  },
  {
    q: "Comment trouver un professionnel près de chez moi ?",
    a: "Utilisez la recherche par métier et par ville. Vous pouvez filtrer par localisation, type de prestation et disponibilité. Les entreprises Premium proposent également la réservation en ligne directement depuis leur profil.",
  },
  {
    q: "Les avis sont-ils fiables ?",
    a: "Oui. Seuls les clients ayant effectué une réservation confirmée peuvent laisser un avis. Cela garantit que chaque note reflète une expérience réelle, sans faux commentaires.",
  },
  {
    q: "Comment référencer mon entreprise sur Proxilio ?",
    a: "Créez un compte professionnel gratuitement, complétez votre fiche (services, photos, zone d'intervention) et soumettez votre demande. Notre équipe valide votre profil sous 48 h. L'offre Premium (30 €/mois ou 270 €/an) débloque la réservation en ligne, le calendrier de disponibilités et des statistiques détaillées.",
  },
  {
    q: "Proxilio est-il gratuit pour les particuliers ?",
    a: "Oui, l'accès à Proxilio est totalement gratuit pour les particuliers. La recherche, la consultation des profils et la prise de contact ne nécessitent aucun abonnement.",
  },
];

function Item({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-light text-[#132A24] tracking-tight group-hover:text-[#4b8a74] transition-colors">
          {q}
        </span>
        <span className={`shrink-0 w-5 h-5 rounded-full border border-black/10 flex items-center justify-center transition-transform ${open ? "rotate-45" : ""}`}>
          <svg className="w-3 h-3 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm font-light text-[#4b615a] leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-32 w-full border-t border-black/5">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        <div className="lg:col-span-4 rv-blur">
          <p className="text-sm uppercase tracking-widest text-[#879f98] mb-6 font-light flex items-center gap-2">
            <span className="w-6 h-px bg-[#879f98]" /> FAQ
          </p>
          <h2 className="font-light text-[32px] sm:text-[48px] leading-tight text-[#132A24] tracking-tight mb-4">
            Questions fréquentes.
          </h2>
          <p className="text-base text-[#4b615a] font-light leading-relaxed">
            Tout ce que vous devez savoir sur Proxilio, la mise en relation et les abonnements professionnels.
          </p>
        </div>

        <div className="lg:col-span-8 rv-up rv-d1">
          <div className="rounded-[2rem] border border-black/5 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] px-6 sm:px-10">
            {FAQS.map((faq, i) => (
              <Item
                key={i}
                q={faq.q}
                a={faq.a}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

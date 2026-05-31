import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const VALUES = [
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z",
    title: "Vérification manuelle",
    desc: "Chaque professionnel est examiné par notre équipe avant publication. Numéro SIRET, activité réelle, cohérence du profil — rien n'est automatisé.",
  },
  {
    icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    title: "Avis 100% authentiques",
    desc: "Un avis ne peut être déposé qu'après une réservation confirmée sur Proxilio. Zéro avis acheté, zéro avis inventé.",
  },
  {
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    title: "Proximité locale",
    desc: "Proxilio se concentre sur les professionnels de proximité. Notre mission : remettre la confiance au cœur de la relation client-artisan.",
  },
];

const STATS = [
  { value: "100%", label: "Pros vérifiés manuellement" },
  { value: "48h", label: "Délai de validation max" },
  { value: "0€", label: "Pour les particuliers" },
];

export default function AboutPage() {
  const canonical = "https://proxilio.fr/a-propos";
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Proxilio",
    url: "https://proxilio.fr",
    logo: "https://proxilio.fr/assets/img/logo.png",
    description: "Proxilio connecte les particuliers aux professionnels locaux vérifiés. Chaque professionnel est validé manuellement. Les avis sont authentiques car déposés uniquement après réservation confirmée.",
    foundingDate: "2025",
    contactPoint: { "@type": "ContactPoint", email: "contact@proxilio.fr", contactType: "customer support", availableLanguage: "French" },
    sameAs: ["https://proxilio.fr"],
  };

  return (
    <>
      <Helmet>
        <title>À propos de Proxilio — Notre mission et nos valeurs</title>
        <meta name="description" content="Proxilio est une plateforme française qui connecte les particuliers aux professionnels locaux vérifiés manuellement. Découvrez notre mission, notre processus de vérification et nos valeurs." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="À propos de Proxilio" />
        <meta property="og:description" content="Comment fonctionne Proxilio ? Qui vérifie les pros ? Découvrez notre mission et nos engagements." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-20">

        {/* Hero */}
        <header className="text-center space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">À propos</p>
          <h1 className="text-4xl sm:text-5xl font-light text-[#132A24] tracking-tight leading-tight">
            Connecter les personnes,<br />pas les algorithmes
          </h1>
          <p className="text-lg font-light text-[#4b615a] leading-relaxed max-w-2xl mx-auto">
            Proxilio est né d'un constat simple : trouver un professionnel local de confiance reste difficile. Les annuaires sont remplis de profils abandonnés, les avis sont souvent achetés, et personne ne vérifie vraiment qui est derrière la fiche.
          </p>
          <p className="text-lg font-light text-[#4b615a] leading-relaxed max-w-2xl mx-auto">
            Notre réponse : une plateforme où <strong className="font-normal text-[#132A24]">chaque professionnel est vérifié manuellement</strong> et où les avis ne peuvent être déposés qu'après une réservation réelle.
          </p>
        </header>

        {/* Chiffres */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-black/5 bg-[#f5f7f6] p-6 text-center space-y-2">
              <p className="text-4xl font-light text-[#132A24] tracking-tight">{value}</p>
              <p className="text-sm font-light text-[#879f98]">{label}</p>
            </div>
          ))}
        </section>

        {/* Notre processus */}
        <section className="space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Notre processus</p>
            <h2 className="text-2xl font-light text-[#132A24] tracking-tight">Comment on vérifie un professionnel</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "01", title: "Soumission du dossier", desc: "Le professionnel crée son compte et soumet sa fiche avec nom de l'entreprise, activité, adresse et contact." },
              { step: "02", title: "Vérification manuelle", desc: "Notre équipe contrôle le numéro SIRET sur les bases officielles (INPI), vérifie la cohérence des informations et l'existence réelle de l'activité." },
              { step: "03", title: "Validation ou refus", desc: "Si tout est correct, la fiche est publiée sous 48h. En cas de doute, nous demandons des documents complémentaires. Les profils incomplets ou douteux sont refusés." },
              { step: "04", title: "Suivi continu", desc: "Les avis déposés sont liés à des réservations réelles. Tout signalement d'anomalie est traité par notre équipe." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 p-5 rounded-2xl border border-black/5 bg-white hover:border-[#132A24]/10 transition-colors">
                <span className="text-2xl font-light text-[#132A24]/15 tracking-tight shrink-0 w-10">{step}</span>
                <div>
                  <p className="text-sm font-normal text-[#132A24] mb-1">{title}</p>
                  <p className="text-sm font-light text-[#4b615a] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Valeurs */}
        <section className="space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Nos engagements</p>
            <h2 className="text-2xl font-light text-[#132A24] tracking-tight">Ce en quoi on croit</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-black/5 bg-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#eef5f1] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <p className="text-sm font-normal text-[#132A24]">{title}</p>
                <p className="text-sm font-light text-[#4b615a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Modèle */}
        <section className="rounded-2xl bg-[#132A24] p-8 sm:p-10 space-y-5">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-light">Notre modèle</p>
          <h2 className="text-2xl font-light text-white tracking-tight">Gratuit pour les particuliers, accessible pour les pros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { who: "Particuliers", desc: "Accès totalement gratuit. Recherche, consultation des fiches, prise de contact et lecture des avis — sans inscription requise." },
              { who: "Professionnels", desc: "Listing gratuit. L'offre Premium (10 €/mois ou 100 €/an) débloque la réservation en ligne, les statistiques avancées, devis et factures." },
            ].map(({ who, desc }) => (
              <div key={who} className="bg-white/5 rounded-xl p-5">
                <p className="text-sm font-normal text-white mb-2">{who}</p>
                <p className="text-sm font-light text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="text-center space-y-4 border-t border-black/5 pt-12">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Contact</p>
          <h2 className="text-2xl font-light text-[#132A24] tracking-tight">Une question ? Une remarque ?</h2>
          <p className="text-sm font-light text-[#879f98]">
            Notre équipe répond à toutes les demandes via notre formulaire de contact ou à{" "}
            <a href="mailto:contact@proxilio.fr" className="text-[#132A24] underline underline-offset-4 decoration-[#132A24]/30 hover:decoration-[#132A24] transition-colors">
              contact@proxilio.fr
            </a>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Link to="/contact" className="px-6 py-3 rounded-xl bg-[#132A24] text-white text-sm font-light hover:bg-[#1e3d33] transition-colors">
              Nous contacter
            </Link>
            <Link to="/professionnels" className="px-6 py-3 rounded-xl border border-black/10 text-[#132A24] text-sm font-light hover:bg-[#eef5f1] transition-colors">
              Trouver un professionnel
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}

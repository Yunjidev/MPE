import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getData } from "../../services/data-fetch";
import "./home.css";

import HeroSection       from "./components/HeroSection";
import WhyMpeSection     from "./components/WhyMpeSection";
import FeaturesSection   from "./components/FeaturesSection";
import PricingSection    from "./components/PricingSection";

/* ─── Scroll reveal ──────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          obs.unobserve(e.target);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => e.target.classList.add("in-view"))
          );
        }
      }),
      { threshold: 0.10 }
    );
    document.querySelectorAll(".rv-up, .rv-blur").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const BASE_URL = "https://proxilio.fr";

export default function HomeClient() {
  useReveal();

  const [premiumEnterprises, setPremiumEnterprises] = useState([]);

  useEffect(() => {
    getData("enterprises/premium")
      .then((data) => { if (Array.isArray(data)) setPremiumEnterprises(data); })
      .catch(() => {});
  }, []);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Proxilio",
    url: BASE_URL,
    logo: `${BASE_URL}/assets/img/logo.png`,
    description: "Proxilio connecte les particuliers aux professionnels locaux vérifiés. Trouvez, réservez et évaluez des artisans et entrepreneurs près de chez vous.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@proxilio.fr",
      contactType: "customer support",
      availableLanguage: "French",
    },
    sameAs: [BASE_URL],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Proxilio",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/searchentreprise?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qu'est-ce que Proxilio ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Proxilio est une plateforme qui met en relation des particuliers avec des professionnels locaux vérifiés. Chaque entreprise est validée manuellement avant publication.",
        },
      },
      {
        "@type": "Question",
        name: "Comment trouver un professionnel près de chez moi ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Utilisez la recherche par métier et par ville. Les entreprises Premium proposent la réservation en ligne directement depuis leur profil.",
        },
      },
      {
        "@type": "Question",
        name: "Les avis sont-ils fiables ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui. Seuls les clients ayant effectué une réservation confirmée peuvent laisser un avis, ce qui garantit des retours authentiques.",
        },
      },
      {
        "@type": "Question",
        name: "Comment référencer mon entreprise sur Proxilio ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Créez un compte professionnel gratuitement et soumettez votre dossier. Notre équipe valide votre profil sous 48 h. L'offre Premium (30 €/mois ou 270 €/an) débloque la réservation en ligne et les statistiques avancées.",
        },
      },
      {
        "@type": "Question",
        name: "Proxilio est-il gratuit pour les particuliers ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, l'accès est totalement gratuit pour les particuliers. La recherche, la consultation des profils et la prise de contact ne nécessitent aucun abonnement.",
        },
      },
    ],
  };

  return (
    <>
    <Helmet>
      <title>Proxilio — Professionnels locaux vérifiés</title>
      <meta name="description" content="Trouvez et réservez des professionnels locaux vérifiés. Artisans, plombiers, électriciens — Proxilio connecte particuliers et pros partout en France." />
      <link rel="canonical" href={`${BASE_URL}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${BASE_URL}/`} />
      <meta property="og:title" content="Proxilio — Professionnels locaux vérifiés" />
      <meta property="og:description" content="Trouvez et réservez des professionnels locaux vérifiés. Artisans, plombiers, électriciens — Proxilio connecte particuliers et pros partout en France." />
      <meta property="og:image" content={`${BASE_URL}/assets/img/og-default.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Proxilio" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Proxilioapp" />
      <meta name="twitter:title" content="Proxilio — Professionnels locaux vérifiés" />
      <meta name="twitter:description" content="Trouvez et réservez des professionnels locaux vérifiés. Artisans, plombiers, électriciens — Proxilio connecte particuliers et pros partout en France." />
      <meta name="twitter:image" content={`${BASE_URL}/assets/img/og-default.jpg`} />
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(webSiteJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <div className="text-[#132A24] antialiased overflow-x-hidden">
      <HeroSection />
      <div className="w-full h-px bg-black/5" />
      <WhyMpeSection premiumEnterprises={premiumEnterprises} />
      <FeaturesSection />
      <PricingSection />
    </div>
    </>
  );
}

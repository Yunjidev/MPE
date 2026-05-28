import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getData } from "../../services/data-fetch";
import "./home.css";

import HeroSection      from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import WhyMpeSection    from "./components/WhyMpeSection";
import FeaturesSection  from "./components/FeaturesSection";
import StatsSection     from "./components/StatsSection";
import PricingSection   from "./components/PricingSection";

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

export default function HomeClient() {
  useReveal();

  const [stats, setStats] = useState({
    userLength: 0, entrepreneurLength: 0,
    enterpriseLength: 0, premiumEnterpriseLength: 0,
  });
  const [premiumEnterprises, setPremiumEnterprises] = useState([]);

  useEffect(() => {
    getData("stats").then(setStats).catch(() => {});
    getData("enterprises/premium")
      .then((data) => { if (Array.isArray(data)) setPremiumEnterprises(data); })
      .catch(() => {});
  }, []);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Proxilio",
    url: "https://www.proxilio.fr",
    logo: "https://www.proxilio.fr/assets/img/logo.png",
    description: "Proxilio connecte les particuliers aux meilleurs professionnels locaux vérifiés. Trouvez, réservez et évaluez des artisans et entrepreneurs près de chez vous.",
    sameAs: ["https://www.proxilio.fr"],
  };

  return (
    <>
    <Helmet>
      <title>Proxilio — Professionnels locaux vérifiés</title>
      <meta name="description" content="Trouvez, réservez et évaluez des professionnels locaux vérifiés près de chez vous. Plombiers, électriciens, artisans — Proxilio vous met en relation avec les meilleurs pros de votre région." />
      <link rel="canonical" href="https://www.proxilio.fr/" />
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
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

import { useEffect, useState } from "react";
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

  return (
    <div className="text-[#132A24] antialiased overflow-x-hidden">
      <HeroSection />
      <div className="w-full h-px bg-black/5" />
      <WhyMpeSection premiumEnterprises={premiumEnterprises} />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

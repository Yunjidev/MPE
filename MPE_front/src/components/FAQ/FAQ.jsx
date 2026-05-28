/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";

const QUESTIONS = [
  {
    category: "Création de profil et inscription",
    items: [
      {
        question: "Comment créer un compte sur Proxilio ?",
        answer: "Cliquez sur « S'inscrire » en haut à droite, remplissez les informations requises et confirmez votre adresse e-mail. Vous aurez ensuite accès à tous les services de la plateforme.",
      },
      {
        question: "Comment créer ma fiche entreprise ?",
        answer: "Depuis votre tableau de bord, cliquez sur « Créer une entreprise » et complétez votre profil avec vos services, photos et informations professionnelles. Votre fiche sera ensuite vérifiée et validée par notre équipe avant publication.",
      },
    ],
  },
  {
    category: "Recherche et sélection de professionnels",
    items: [
      {
        question: "Comment trouver un professionnel près de chez moi ?",
        answer: "Utilisez la recherche disponible sur la page d'accueil ou dans l'onglet « Recherche ». Vous pouvez filtrer par métier, ville et rayon géographique pour affiner vos résultats.",
      },
      {
        question: "Les entreprises sont-elles vérifiées ?",
        answer: "Oui, chaque entreprise est validée manuellement par notre équipe avant d'apparaître sur la plateforme.",
      },
    ],
  },
  {
    category: "Avis et évaluations",
    items: [
      {
        question: "Puis-je laisser un avis sur une entreprise ?",
        answer: "Oui, mais uniquement après avoir effectué une réservation avec cette entreprise. Cette règle garantit l'authenticité de tous les avis publiés sur la plateforme.",
      },
    ],
  },
  {
    category: "Réservation en ligne",
    items: [
      {
        question: "Comment fonctionne la réservation en ligne ?",
        answer: "Les entreprises Premium disposent d'un calendrier intégré. Vous pouvez consulter leurs disponibilités et prendre rendez-vous directement depuis leur fiche, sans avoir besoin d'appeler.",
      },
    ],
  },
  {
    category: "Offre Premium",
    items: [
      {
        question: "Qu'est-ce que l'offre Premium pour les professionnels ?",
        answer: "L'offre Premium permet aux entreprises de bénéficier d'une mise en avant sur la page d'accueil, d'une priorité dans les résultats de recherche, d'un badge de confiance, d'un calendrier de réservation en ligne et de statistiques avancées.",
      },
      {
        question: "Quelles sont les formules disponibles ?",
        answer: "Deux formules sont disponibles : Mensuel à 30 €/mois (résiliable à tout moment) et Annuel à 270 €/an (soit 2 mois offerts). Le paiement est sécurisé via Stripe.",
      },
    ],
  },
  {
    category: "Support et assistance",
    items: [
      {
        question: "Comment contacter le support ?",
        answer: "Vous pouvez nous écrire depuis la page Contact ou par e-mail à contact@proxilio.fr. Notre équipe vous répondra dans les meilleurs délais.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-24 w-full">
      <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-14 sm:mb-20">
        <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-5 flex items-center gap-2">
          <span className="w-6 h-px bg-[#879f98]" /> FAQ
        </p>
        <h1 className="font-light text-[40px] sm:text-[56px] leading-tight tracking-tight text-[#132A24] mb-6">
          Des questions ?<br />
          <span className="text-[#274F44]">On a les réponses.</span>
        </h1>
        <p className="text-base sm:text-xl text-[#4b615a] font-light leading-relaxed tracking-tight">
          Retrouvez les réponses aux questions les plus fréquentes. Vous ne trouvez pas ce que vous cherchez ?{" "}
          <Link to="/contact" className="text-[#132A24] underline decoration-1 underline-offset-4 decoration-[#132A24]/30 hover:decoration-[#132A24] transition-colors">
            Contactez-nous.
          </Link>
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {QUESTIONS.map((section, i) => (
          <DropdownMenu
            key={i}
            category={section.category}
            items={section.items}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      </div>
    </div>
  );
};

export default FAQ;

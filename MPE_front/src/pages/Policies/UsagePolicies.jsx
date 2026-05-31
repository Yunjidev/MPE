import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-sm font-light uppercase tracking-widest text-[#879f98] mb-3">{title}</h2>
    <div className="text-sm font-light text-[#132A24] leading-relaxed space-y-2">{children}</div>
  </div>
);

const UsagePolicies = () => (
  <>
    <Helmet>
      <title>Conditions d'utilisation | Proxilio</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Juridique</p>
      <h1 className="text-3xl font-light text-[#132A24] tracking-tight mb-2">{"Conditions générales d'utilisation"}</h1>
      <p className="text-sm text-[#879f98] font-light mb-10">Dernière mise à jour : mai 2025</p>

      <Section title="1. Présentation de Proxilio">
        <p>
          Proxilio est une plateforme de mise en relation entre des particuliers et des professionnels locaux. Elle permet aux utilisateurs de trouver, contacter et réserver les services de professionnels vérifiés dans leur zone géographique.
        </p>
        <p>
          Éditeur : Proxilio, représenté par Florian Van Camp — <a href="mailto:contact@proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">contact@proxilio.fr</a>
        </p>
      </Section>

      <Section title="2. Accès et inscription">
        <p>
          L'accès à la plateforme est gratuit pour les particuliers. La création d'un compte est nécessaire pour effectuer une réservation ou créer un profil professionnel.
        </p>
        <p>
          L'utilisateur s'engage à fournir des informations exactes et à tenir son profil à jour. Tout compte créé avec de fausses informations pourra être suspendu.
        </p>
      </Section>

      <Section title="3. Comptes professionnels">
        <p>
          Les professionnels souhaitant référencer leur entreprise doivent soumettre un dossier. Proxilio se réserve le droit de valider ou refuser toute demande d'inscription, notamment en cas d'activité illégale, trompeuse ou contraire aux présentes CGU.
        </p>
        <p>
          L'offre <strong className="font-normal">Premium</strong> (10 €/mois ou 100 €/an) donne accès à des fonctionnalités avancées : gestion du calendrier, prise de rendez-vous en ligne, statistiques. L'abonnement est souscrit via Stripe et renouvelé automatiquement jusqu'à résiliation.
        </p>
      </Section>

      <Section title="4. Comportement des utilisateurs">
        <p>Il est interdit sur Proxilio de :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publier des contenus faux, trompeurs, offensants ou illégaux</li>
          <li>Usurper l'identité d'un tiers</li>
          <li>Tenter de contourner les systèmes de sécurité</li>
          <li>Utiliser la plateforme à des fins de spam ou de démarchage abusif</li>
          <li>Contacter des professionnels en dehors de la plateforme à des fins de fraude</li>
        </ul>
      </Section>

      <Section title="5. Réservations">
        <p>
          Les réservations effectuées via Proxilio constituent un engagement entre l'utilisateur et le professionnel. Proxilio agit en tant qu'intermédiaire technique et n'est pas partie au contrat de prestation.
        </p>
        <p>
          En cas de litige entre un particulier et un professionnel, Proxilio pourra être contacté à titre d'information mais ne saurait être tenu responsable de l'exécution de la prestation.
        </p>
      </Section>

      <Section title="6. Avis et notations">
        <p>
          Les utilisateurs peuvent laisser des avis sur les prestations réalisées. Ces avis doivent être honnêtes et basés sur une expérience réelle. Tout avis diffamatoire, faux ou abusif pourra être supprimé.
        </p>
      </Section>

      <Section title="7. Responsabilité de Proxilio">
        <p>
          Proxilio met en œuvre tous les moyens raisonnables pour assurer la disponibilité et la sécurité de la plateforme, mais ne saurait être tenu responsable d'interruptions temporaires de service, de pertes de données ou de dysfonctionnements indépendants de sa volonté.
        </p>
        <p>
          Proxilio ne garantit pas l'exactitude des informations publiées par les professionnels (tarifs, horaires, disponibilités).
        </p>
      </Section>

      <Section title="8. Propriété intellectuelle">
        <p>
          La marque, le logo et l'ensemble des contenus de Proxilio sont la propriété exclusive de Proxilio. Toute reproduction sans autorisation est interdite.
        </p>
        <p>
          Les professionnels conservent la propriété de leurs contenus (photos, descriptions) et accordent à Proxilio une licence d'affichage non exclusive pour la durée de leur inscription.
        </p>
      </Section>

      <Section title="9. Résiliation">
        <p>
          Tout utilisateur peut supprimer son compte à tout moment depuis son tableau de bord. Les professionnels avec un abonnement Premium actif peuvent résilier depuis la page de gestion de leur abonnement — l'accès Premium reste actif jusqu'à la fin de la période facturée.
        </p>
        <p>
          Proxilio se réserve le droit de suspendre ou supprimer tout compte en infraction avec les présentes CGU, sans préavis.
        </p>
      </Section>

      <Section title="10. Modification des CGU">
        <p>
          Proxilio se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par e-mail en cas de modification substantielle. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.
        </p>
      </Section>

      <Section title="11. Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relèvera de la compétence exclusive des tribunaux français.
        </p>
      </Section>

      <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap gap-4 text-xs font-light text-[#879f98]">
        <Link to="/legal-notices" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Mentions légales</Link>
        <Link to="/confidentiality-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de confidentialité</Link>
        <Link to="/cookie-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de cookies</Link>
      </div>
    </div>
  </>
);

export default UsagePolicies;

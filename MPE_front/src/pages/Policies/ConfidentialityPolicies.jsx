import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-sm font-light uppercase tracking-widest text-[#879f98] mb-3">{title}</h2>
    <div className="text-sm font-light text-[#132A24] leading-relaxed space-y-2">{children}</div>
  </div>
);

const ConfidentialityPolicies = () => (
  <>
    <Helmet>
      <title>Politique de confidentialité | Proxilio</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Juridique</p>
      <h1 className="text-3xl font-light text-[#132A24] tracking-tight mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-[#879f98] font-light mb-10">Dernière mise à jour : mai 2025</p>

      <Section title="1. Responsable du traitement">
        <p>Le responsable du traitement des données personnelles collectées sur <strong className="font-normal">www.proxilio.fr</strong> est :</p>
        <p><strong className="font-normal">Proxilio</strong> — représenté par Florian Van Camp</p>
        <p>Contact : <a href="mailto:contact@proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">contact@proxilio.fr</a></p>
      </Section>

      <Section title="2. Données collectées">
        <p>Proxilio collecte les données suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nom d'utilisateur, prénom, nom et adresse e-mail (inscription)</li>
          <li>Photo de profil (optionnel)</li>
          <li>Informations d'entreprise (nom, adresse, description, logo, photos) pour les professionnels</li>
          <li>Historique des réservations</li>
          <li>Données de navigation (voir <Link to="/cookie-policies" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">politique de cookies</Link>)</li>
        </ul>
      </Section>

      <Section title="3. Finalités du traitement">
        <ul className="list-disc pl-5 space-y-1">
          <li>Gestion du compte et accès à la plateforme</li>
          <li>Mise en relation entre particuliers et professionnels</li>
          <li>Gestion des réservations et notifications associées</li>
          <li>Envoi d'e-mails transactionnels (confirmation, réinitialisation de mot de passe)</li>
          <li>Amélioration continue du service</li>
        </ul>
      </Section>

      <Section title="4. Base légale">
        <p>
          Le traitement repose sur votre consentement (inscription volontaire) et sur l'exécution du contrat de mise en relation.
        </p>
      </Section>

      <Section title="5. Durée de conservation">
        <p>
          Vos données sont conservées pendant la durée d'activité de votre compte. En cas de suppression, elles sont effacées sous 30 jours, sauf obligation légale contraire.
        </p>
      </Section>

      <Section title="6. Partage des données">
        <p>Proxilio ne vend ni ne loue vos données. Elles peuvent être transmises aux prestataires suivants dans le strict cadre du service :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="font-normal">IONOS SE</strong> — hébergement des serveurs</li>
          <li><strong className="font-normal">Stripe</strong> — traitement sécurisé des paiements (abonnement Premium)</li>
        </ul>
      </Section>

      <Section title="7. Vos droits (RGPD)">
        <p>Vous disposez des droits suivants sur vos données :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Accès, rectification et effacement</li>
          <li>Portabilité et opposition au traitement</li>
          <li>Retrait du consentement à tout moment</li>
        </ul>
        <p>Pour exercer vos droits : <a href="mailto:contact@proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">contact@proxilio.fr</a></p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Proxilio met en œuvre des mesures techniques adaptées : chiffrement HTTPS, hachage des mots de passe, tokens JWT à durée limitée (15 minutes pour l'accès, 7 jours pour le renouvellement).
        </p>
      </Section>

      <Section title="9. Réclamations">
        <p>
          Vous pouvez adresser une réclamation à la <strong className="font-normal">CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">www.cnil.fr</a>
        </p>
      </Section>

      <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap gap-4 text-xs font-light text-[#879f98]">
        <Link to="/legal-notices" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Mentions légales</Link>
        <Link to="/cookie-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de cookies</Link>
        <Link to="/usage-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Conditions d'utilisation</Link>
      </div>
    </div>
  </>
);

export default ConfidentialityPolicies;

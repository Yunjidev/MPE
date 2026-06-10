import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-sm font-light uppercase tracking-widest text-[#879f98] mb-3">{title}</h2>
    <div className="text-sm font-light text-[#132A24] leading-relaxed space-y-2">{children}</div>
  </div>
);

const CookiePolicies = () => (
  <>
    <Helmet>
      <title>Politique de cookies | Proxilio</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Juridique</p>
      <h1 className="text-3xl font-light text-[#132A24] tracking-tight mb-2">Politique de cookies</h1>
      <p className="text-sm text-[#879f98] font-light mb-10">Dernière mise à jour : mai 2025</p>

      <Section title="1. Qu'est-ce qu'un cookie ?">
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) lors de votre navigation sur un site web. Il permet au site de mémoriser vos préférences et d'assurer certaines fonctionnalités.
        </p>
      </Section>

      <Section title="2. Cookies utilisés par Proxilio">
        <p>Proxilio utilise exclusivement des cookies strictement nécessaires au fonctionnement du service :</p>

        <div className="rounded-xl border border-black/5 overflow-hidden mt-3">
          <table className="w-full text-xs font-light">
            <thead className="bg-[#f5f7f6]">
              <tr>
                <th className="text-left px-4 py-2.5 text-[#879f98] font-light uppercase tracking-widest text-[10px]">Cookie</th>
                <th className="text-left px-4 py-2.5 text-[#879f98] font-light uppercase tracking-widest text-[10px]">Finalité</th>
                <th className="text-left px-4 py-2.5 text-[#879f98] font-light uppercase tracking-widest text-[10px]">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <tr>
                <td className="px-4 py-3 text-[#132A24]"><code className="bg-[#f5f7f6] px-1.5 py-0.5 rounded text-[11px]">mpe-auth</code></td>
                <td className="px-4 py-3 text-[#879f98]">Token d'accès (authentification)</td>
                <td className="px-4 py-3 text-[#879f98]">Session (15 min)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#132A24]"><code className="bg-[#f5f7f6] px-1.5 py-0.5 rounded text-[11px]">mpe-refresh</code></td>
                <td className="px-4 py-3 text-[#879f98]">Token de renouvellement de session</td>
                <td className="px-4 py-3 text-[#879f98]">7 jours</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#132A24]"><code className="bg-[#f5f7f6] px-1.5 py-0.5 rounded text-[11px]">cookie_consent</code></td>
                <td className="px-4 py-3 text-[#879f98]">Mémorisation de votre choix de consentement</td>
                <td className="px-4 py-3 text-[#879f98]">365 jours</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3">
          Proxilio <strong className="font-normal">n'utilise pas</strong> de cookies publicitaires, de traceurs tiers ou d'outils d'analyse comportementale.
        </p>
      </Section>

      <Section title="3. Cookies tiers">
        <p>
          Dans le cadre de l'abonnement Premium, Proxilio intègre <strong className="font-normal">Stripe</strong> pour le traitement des paiements. Stripe peut déposer ses propres cookies lors du processus de paiement. Consultez la <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">politique de confidentialité de Stripe</a> pour plus d'informations.
        </p>
      </Section>

      <Section title="4. Gestion des cookies">
        <p>
          Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies à tout moment. Notez que la désactivation des cookies techniques nécessaires peut empêcher l'accès à certaines fonctionnalités de Proxilio (connexion, réservations).
        </p>
        <p>Guides selon votre navigateur :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">Safari</a></li>
          <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">Microsoft Edge</a></li>
        </ul>
      </Section>

      <Section title="5. Contact">
        <p>
          Pour toute question relative aux cookies : <a href="mailto:contact@proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">contact@proxilio.fr</a>
        </p>
      </Section>

      <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap gap-4 text-xs font-light text-[#879f98]">
        <Link to="/legal-notices" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Mentions légales</Link>
        <Link to="/confidentiality-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de confidentialité</Link>
        <Link to="/usage-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Conditions d'utilisation</Link>
      </div>
    </div>
  </>
);

export default CookiePolicies;

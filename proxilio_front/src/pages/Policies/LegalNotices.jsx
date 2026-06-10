import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-sm font-light uppercase tracking-widest text-[#879f98] mb-3">{title}</h2>
    <div className="text-sm font-light text-[#132A24] leading-relaxed space-y-2">{children}</div>
  </div>
);

const LegalNotices = () => (
  <>
    <Helmet>
      <title>Mentions légales | Proxilio</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Juridique</p>
      <h1 className="text-3xl font-light text-[#132A24] tracking-tight mb-10">Mentions légales</h1>

      <Section title="1. Éditeur du site">
        <p><strong className="font-normal">Raison sociale :</strong> Proxilio</p>
        <p><strong className="font-normal">Forme juridique :</strong> Auto-entrepreneur</p>
        <p><strong className="font-normal">Directeur de la publication :</strong> Proxilio</p>
        <p><strong className="font-normal">Adresse e-mail :</strong> <a href="mailto:contact@proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">contact@proxilio.fr</a></p>
        <p><strong className="font-normal">Site web :</strong> <a href="https://www.proxilio.fr" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">www.proxilio.fr</a></p>
      </Section>

      <Section title="2. Hébergeur du site">
        <p><strong className="font-normal">Hébergeur :</strong> IONOS SE</p>
        <p><strong className="font-normal">Adresse :</strong> Elgendorfer Str. 57, 56410 Montabaur, Allemagne</p>
        <p><strong className="font-normal">Site web :</strong> <a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#4b8a74] transition-colors">www.ionos.fr</a></p>
      </Section>

      <Section title="3. Propriété intellectuelle">
        <p>
          L'ensemble des contenus présents sur le site Proxilio (textes, images, logos, graphismes) est protégé par le droit de la propriété intellectuelle et est la propriété exclusive de Proxilio, sauf mentions contraires.
        </p>
        <p>
          Toute reproduction, distribution, modification ou utilisation de ces contenus, sans autorisation préalable écrite, est strictement interdite.
        </p>
      </Section>

      <Section title="4. Responsabilité">
        <p>
          Proxilio s'efforce de maintenir les informations disponibles sur ce site à jour et exactes. Toutefois, Proxilio ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
        </p>
        <p>
          Proxilio ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.
        </p>
      </Section>

      <Section title="5. Liens hypertextes">
        <p>
          Le site Proxilio peut contenir des liens vers des sites tiers. Proxilio n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>
      </Section>

      <Section title="6. Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </Section>

      <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap gap-4 text-xs font-light text-[#879f98]">
        <Link to="/confidentiality-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de confidentialité</Link>
        <Link to="/cookie-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Politique de cookies</Link>
        <Link to="/usage-policies" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Conditions d'utilisation</Link>
      </div>
    </div>
  </>
);

export default LegalNotices;

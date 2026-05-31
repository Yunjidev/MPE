import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const SUGGESTIONS = [
  { label: "Plombier",       to: "/professionnels/plombier" },
  { label: "Électricien",    to: "/professionnels/electricien" },
  { label: "Artisan",        to: "/professionnels/artisan" },
  { label: "Maçon",          to: "/professionnels/macon" },
];

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page introuvable | Proxilio</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Numéro */}
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">
          Erreur 404
        </p>
        <h1 className="text-8xl sm:text-9xl font-light text-[#132A24]/10 tracking-tight leading-none select-none mb-2">
          404
        </h1>
        <p className="text-xl font-light text-[#132A24] tracking-tight mt-2 mb-2">
          Cette page n&apos;existe pas.
        </p>
        <p className="text-sm text-[#879f98] font-light mb-10 max-w-sm leading-relaxed">
          Le lien est peut-être incorrect ou la page a été déplacée.
        </p>

        {/* CTA principaux */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[#132A24] text-white text-sm font-light tracking-tight hover:bg-[#1e3d33] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            to="/professionnels"
            className="px-6 py-3 rounded-xl border border-black/10 text-[#132A24] text-sm font-light tracking-tight hover:bg-[#eef5f1] transition-colors"
          >
            Tous les professionnels
          </Link>
        </div>

        {/* Suggestions rapides */}
        <div className="border-t border-black/5 pt-10 w-full max-w-sm">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">
            Métiers populaires
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 rounded-full border border-black/8 text-sm font-light text-[#132A24] hover:bg-[#eef5f1] hover:border-[#132A24]/20 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-light text-[#879f98]">
          <Link to="/faq" className="hover:text-[#132A24] transition-colors underline underline-offset-4">FAQ</Link>
          <Link to="/contact" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Contact</Link>
          <Link to="/blog" className="hover:text-[#132A24] transition-colors underline underline-offset-4">Blog</Link>
        </div>

      </div>
    </>
  );
}

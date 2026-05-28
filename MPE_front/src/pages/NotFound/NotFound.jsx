import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page introuvable | Proxilio</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-6">
          Erreur 404
        </p>
        <h1 className="text-6xl sm:text-8xl font-light text-[#132A24] tracking-tight mb-4">
          404
        </h1>
        <p className="text-lg font-light text-[#132A24] tracking-tight mb-2">
          Cette page n&apos;existe pas.
        </p>
        <p className="text-sm text-[#879f98] font-light mb-10 max-w-sm">
          Le lien est peut-être incorrect ou la page a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[#132A24] text-white text-sm font-light tracking-tight hover:bg-[#1e3d33] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            to="/searchentreprise"
            className="px-6 py-3 rounded-xl border border-black/10 text-[#132A24] text-sm font-light tracking-tight hover:bg-[#eef5f1] transition-colors"
          >
            Rechercher un professionnel
          </Link>
        </div>
      </div>
    </>
  );
}

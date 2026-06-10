import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ARTICLES } from "../../data/blog-articles";

export default function BlogIndex() {
  return (
    <>
      <Helmet>
        <title>Blog & Guides — Conseils travaux et artisanat | Proxilio</title>
        <meta name="description" content="Guides pratiques pour bien choisir un artisan, lire un devis, éviter les arnaques et réussir vos travaux. Conseils d'experts par l'équipe Proxilio." />
        <link rel="canonical" href="https://proxilio.fr/blog" />
        <meta property="og:title" content="Blog & Guides | Proxilio" />
        <meta property="og:description" content="Guides pratiques pour bien choisir un artisan et réussir vos travaux." />
        <meta property="og:url" content="https://proxilio.fr/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Proxilio — Blog & Guides",
          url: "https://proxilio.fr/blog",
          description: "Guides pratiques pour bien choisir un artisan et réussir vos travaux.",
        })}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Ressources</p>
          <h1 className="text-3xl font-light text-[#132A24] tracking-tight">Guides & Conseils</h1>
          <p className="mt-2 text-sm font-light text-[#879f98]">
            Tout ce qu'il faut savoir pour choisir un professionnel, lire un devis et réussir vos travaux.
          </p>
        </div>

        <div className="grid gap-5">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-black/5 bg-white p-6 hover:border-[#132A24]/20 hover:shadow-[0_4px_20px_-8px_rgba(19,42,36,0.12)] transition-all"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-light px-2 py-1 rounded-full bg-[#eef5f1] text-[#132A24]">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-[#879f98] font-light">{article.readTime} de lecture</span>
                </div>
                <h2 className="text-base font-light text-[#132A24] group-hover:underline underline-offset-4 decoration-[#132A24]/20 leading-snug">
                  {article.title}
                </h2>
                <p className="text-sm font-light text-[#879f98] leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <p className="text-xs text-[#879f98] font-light">
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center sm:flex-col sm:justify-center shrink-0">
                <span className="text-xs font-light text-[#132A24] group-hover:translate-x-1 transition-transform">Lire →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

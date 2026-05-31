import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getArticle, ARTICLES } from "../../data/blog-articles";

export default function BlogArticle() {
  const { slug } = useParams();
  const article = getArticle(slug);

  useEffect(() => {
    if (typeof window !== "undefined") window.prerenderReady = true;
  }, []);

  if (!article) return <Navigate to="/blog" replace />;

  const canonical = `https://proxilio.fr/blog/${article.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: canonical,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: "Proxilio", url: "https://proxilio.fr" },
    publisher: {
      "@type": "Organization",
      name: "Proxilio",
      url: "https://proxilio.fr",
      logo: { "@type": "ImageObject", url: "https://proxilio.fr/assets/img/logo.png" },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://proxilio.fr/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://proxilio.fr/blog" },
        { "@type": "ListItem", position: 3, name: article.title, item: canonical },
      ],
    },
  };

  const others = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{article.title} | Proxilio</title>
        <meta name="description" content={article.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-light text-[#879f98] mb-8">
          <Link to="/" className="hover:text-[#132A24] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-[#132A24] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[#132A24] truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-light px-2 py-1 rounded-full bg-[#eef5f1] text-[#132A24]">
              {article.category}
            </span>
            <span className="text-xs text-[#879f98] font-light">{article.readTime} de lecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#132A24] tracking-tight leading-tight">
            {article.title}
          </h1>
          <p className="text-base font-light text-[#879f98] leading-relaxed">
            {article.description}
          </p>
          <p className="text-xs text-[#879f98] font-light border-t border-black/5 pt-4">
            Publié le {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} par l'équipe Proxilio
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-[#132A24] font-light leading-relaxed
          prose-headings:font-light prose-headings:text-[#132A24] prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-[#4b615a] prose-p:leading-relaxed
          prose-strong:text-[#132A24] prose-strong:font-normal
          prose-ul:text-[#4b615a] prose-li:my-1
          prose-table:border-collapse prose-th:bg-[#f5f7f6] prose-th:p-3 prose-th:text-left prose-th:font-normal prose-td:p-3 prose-td:border-b prose-td:border-black/5
          prose-a:text-[#132A24] prose-a:underline prose-a:decoration-[#132A24]/30 hover:prose-a:decoration-[#132A24]
        ">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-14 p-6 rounded-2xl bg-[#132A24] text-white space-y-4">
          <h2 className="text-lg font-light tracking-tight">Trouvez un professionnel vérifié près de chez vous</h2>
          <p className="text-sm font-light text-white/70">
            Proxilio référence des professionnels vérifiés manuellement. Avis authentiques, réservation en ligne pour les abonnés Premium.
          </p>
          <Link
            to="/professionnels"
            className="inline-flex items-center gap-2 bg-white text-[#132A24] px-5 py-2.5 rounded-xl text-sm font-light hover:bg-[#eef5f1] transition-colors"
          >
            Rechercher un pro →
          </Link>
        </div>

        {/* Articles liés */}
        {others.length > 0 && (
          <section className="mt-14 border-t border-black/5 pt-10">
            <h2 className="text-lg font-light text-[#132A24] mb-6">À lire aussi</h2>
            <div className="grid gap-4">
              {others.map((a) => (
                <Link
                  key={a.slug}
                  to={`/blog/${a.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-black/5 p-4 hover:border-[#132A24]/20 hover:bg-[#f5f7f6] transition-all"
                >
                  <div>
                    <p className="text-sm font-light text-[#132A24] group-hover:underline underline-offset-4 decoration-[#132A24]/20">
                      {a.title}
                    </p>
                    <p className="text-xs text-[#879f98] font-light mt-0.5">{a.readTime} de lecture</p>
                  </div>
                  <span className="text-[#879f98] group-hover:translate-x-1 transition-transform shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

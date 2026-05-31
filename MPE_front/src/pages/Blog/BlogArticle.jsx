import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getArticle, ARTICLES } from "../../data/blog-articles";

/* ── Composants de rendu Markdown ─────────────────────────────────── */
const mdComponents = {
  h2: ({ children }) => (
    <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-light text-[#132A24] tracking-tight mt-12 mb-5 pb-3 border-b border-black/5">
      <span className="w-1 h-6 rounded-full bg-[#132A24] flex-shrink-0" aria-hidden="true" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-normal text-[#132A24] tracking-tight mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] text-[#4b615a] font-light leading-[1.85] mb-5">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-normal text-[#132A24]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 space-y-2 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children, ordered }) => (
    <li className={`flex items-start gap-2.5 text-[15px] text-[#4b615a] font-light leading-relaxed ${ordered ? "list-decimal" : ""}`}>
      {!ordered && <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#132A24]/30 flex-shrink-0" aria-hidden="true" />}
      <span className="[&>p]:mb-0 [&>p]:inline">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-5 border-l-2 border-[#132A24]/20 bg-[#f5f7f6] rounded-r-xl py-4 pr-5">
      <div className="text-sm font-light text-[#4b615a] leading-relaxed italic">{children}</div>
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-2xl border border-black/5">
      <table className="w-full text-sm font-light">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#f5f7f6] border-b border-black/5">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-[#4b615a] border-b border-black/5 last:border-0">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-[#f5f7f6]/50 transition-colors">{children}</tr>
  ),
  hr: () => (
    <hr className="my-10 border-0 border-t border-black/5" />
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-[#132A24] underline underline-offset-4 decoration-[#132A24]/30 hover:decoration-[#132A24] transition-colors">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-[#f5f7f6] text-[#132A24] text-xs font-mono border border-black/5">
      {children}
    </code>
  ),
};

/* ── Page ─────────────────────────────────────────────────────────── */
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
        <nav className="flex items-center gap-2 text-xs font-light text-[#879f98] mb-10">
          <Link to="/" className="hover:text-[#132A24] transition-colors">Accueil</Link>
          <span className="text-black/20">/</span>
          <Link to="/blog" className="hover:text-[#132A24] transition-colors">Blog</Link>
          <span className="text-black/20">/</span>
          <span className="text-[#132A24] truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Header article */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] uppercase tracking-widest font-light px-2.5 py-1 rounded-full bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10">
              {article.category}
            </span>
            <span className="text-xs text-[#879f98] font-light">· {article.readTime} de lecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-[#132A24] tracking-tight leading-[1.25] mb-5">
            {article.title}
          </h1>

          {/* Description en lead */}
          <p className="text-lg font-light text-[#4b615a] leading-relaxed border-l-2 border-[#132A24]/20 pl-5">
            {article.description}
          </p>

          <div className="flex items-center gap-4 mt-6 pt-5 border-t border-black/5">
            <div className="w-8 h-8 rounded-full bg-[#132A24] flex items-center justify-center">
              <span className="text-white text-xs font-light">P</span>
            </div>
            <div>
              <p className="text-xs font-light text-[#132A24]">Équipe Proxilio</p>
              <p className="text-[10px] text-[#879f98] font-light">
                {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        {/* Contenu Markdown */}
        <article className="min-w-0">
          <ReactMarkdown components={mdComponents}>
            {article.content}
          </ReactMarkdown>
        </article>

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-[#132A24] p-8 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-light">Proxilio</p>
          <h2 className="text-xl font-light text-white tracking-tight leading-snug">
            Trouvez un professionnel<br />vérifié près de chez vous
          </h2>
          <p className="text-sm font-light text-white/60 leading-relaxed">
            Chaque professionnel est validé manuellement. Avis authentiques uniquement après réservation confirmée.
          </p>
          <Link
            to="/professionnels"
            className="inline-flex items-center gap-2 bg-white text-[#132A24] px-5 py-2.5 rounded-xl text-sm font-light hover:bg-[#eef5f1] transition-colors mt-2"
          >
            Rechercher un pro
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Articles liés */}
        {others.length > 0 && (
          <section className="mt-14 border-t border-black/5 pt-10">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-6">À lire aussi</p>
            <div className="grid gap-3">
              {others.map((a) => (
                <Link
                  key={a.slug}
                  to={`/blog/${a.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-black/5 p-4 hover:border-[#132A24]/20 hover:bg-[#f5f7f6] transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-light text-[#879f98]">{a.category}</span>
                      <span className="text-[10px] text-[#879f98]/60">· {a.readTime}</span>
                    </div>
                    <p className="text-sm font-light text-[#132A24] leading-snug group-hover:underline underline-offset-4 decoration-[#132A24]/20 truncate">
                      {a.title}
                    </p>
                  </div>
                  <span className="text-[#879f98] group-hover:translate-x-1 transition-transform shrink-0 text-sm">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  );
}

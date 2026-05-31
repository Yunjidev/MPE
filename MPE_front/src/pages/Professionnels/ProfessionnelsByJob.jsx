import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getData } from "../../services/data-fetch";
import { FaStar } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";

function slugToLabel(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function citySlug(city) {
  return city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProfessionnelsByJob() {
  const { jobSlug } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getData(`enterprises/by-job/${jobSlug}`)
      .then(setData)
      .catch(() => setData({ enterprises: [], jobName: slugToLabel(jobSlug), cities: [] }))
      .finally(() => {
        setLoading(false);
        if (typeof window !== "undefined") window.prerenderReady = true;
      });
  }, [jobSlug]);

  const jobName    = data?.jobName || slugToLabel(jobSlug);
  const enterprises = data?.enterprises || [];
  const cities      = data?.cities || [];

  const title       = `${jobName} — Professionnels vérifiés | Proxilio`;
  const description = `Trouvez un ${jobName.toLowerCase()} vérifié près de chez vous. ${enterprises.length} professionnel${enterprises.length > 1 ? "s" : ""} référencé${enterprises.length > 1 ? "s" : ""} sur Proxilio.`;
  const canonical   = `https://proxilio.fr/professionnels/${jobSlug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://proxilio.fr/" },
      { "@type": "ListItem", position: 2, name: "Professionnels", item: "https://proxilio.fr/professionnels" },
      { "@type": "ListItem", position: 3, name: jobName, item: canonical },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Comment trouver un bon ${jobName.toLowerCase()} ?`,
        acceptedAnswer: { "@type": "Answer", text: `Sur Proxilio, chaque ${jobName.toLowerCase()} est vérifié manuellement avant publication. Consultez les avis laissés après réservation confirmée pour choisir en confiance.` },
      },
      {
        "@type": "Question",
        name: `Peut-on réserver un ${jobName.toLowerCase()} en ligne ?`,
        acceptedAnswer: { "@type": "Answer", text: `Oui. Les professionnels Premium proposent la réservation en ligne directement depuis leur fiche, 24h/24, sans avoir à téléphoner.` },
      },
      {
        "@type": "Question",
        name: `Les avis sur les ${jobName.toLowerCase()}s sont-ils fiables ?`,
        acceptedAnswer: { "@type": "Answer", text: `Oui. Seuls les clients ayant effectué une réservation confirmée peuvent déposer un avis sur Proxilio, garantissant des retours authentiques.` },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-light text-[#879f98]">
          <Link to="/" className="hover:text-[#132A24] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/professionnels" className="hover:text-[#132A24] transition-colors">Professionnels</Link>
          <span>/</span>
          <span className="text-[#132A24]">{jobName}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-[#132A24] tracking-tight">
            {jobName} <span className="text-[#879f98]">en France</span>
          </h1>
          <p className="mt-2 text-sm font-light text-[#879f98]">
            {loading ? "Chargement…" : `${enterprises.length} professionnel${enterprises.length > 1 ? "s" : ""} vérifié${enterprises.length > 1 ? "s" : ""} sur Proxilio`}
          </p>
        </div>

        {/* Filtre villes */}
        {cities.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {cities.slice(0, 12).map((city) => (
              <Link
                key={city}
                to={`/professionnels/${jobSlug}/${citySlug(city)}`}
                className="px-3 py-1.5 text-xs font-light rounded-full border border-black/10 text-[#132A24] hover:bg-[#eef5f1] transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-[#f5f7f6] h-40 animate-pulse" />
            ))}
          </div>
        ) : enterprises.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#879f98] font-light">Aucun {jobName.toLowerCase()} référencé pour l'instant.</p>
            <Link to="/professionnels" className="mt-4 inline-block text-sm text-[#132A24] underline underline-offset-4">Voir tous les professionnels</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enterprises.map((e) => (
              <Link
                key={e.id}
                to={`/enterprise/${e.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 hover:border-[#132A24]/20 hover:shadow-[0_4px_20px_-8px_rgba(19,42,36,0.12)] transition-all"
              >
                <div className="flex items-center gap-3">
                  {e.logo ? (
                    <img src={e.logo} alt={`Logo ${e.name}`} width={48} height={48} loading="lazy" className="w-12 h-12 rounded-xl object-cover border border-black/5 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#eef5f1] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#132A24] text-xl font-light">{e.name?.[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-light text-[#132A24] truncate group-hover:text-[#132A24]">{e.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {e.isPremium && (
                        <span className="text-[10px] font-light px-1.5 py-0.5 rounded-full bg-[#132A24] text-white">★ Premium</span>
                      )}
                      {e.averageRating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#879f98] font-light">
                          <FaStar className="text-amber-400 text-[10px]" />
                          {e.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {e.city && (
                  <p className="flex items-center gap-1 text-xs font-light text-[#879f98]">
                    <FiMapPin className="flex-shrink-0" />
                    {e.city}{e.zip_code && ` (${e.zip_code})`}
                  </p>
                )}
                {e.description && (
                  <p className="text-xs font-light text-[#879f98] line-clamp-2 leading-relaxed">
                    {e.description.replace(/[#*_[\]]/g, "").slice(0, 120)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* FAQ locale */}
        <section className="border-t border-black/5 pt-8">
          <h2 className="text-xl font-light text-[#132A24] mb-4">Questions fréquentes</h2>
          {[
            { q: `Comment trouver un bon ${jobName.toLowerCase()} ?`, a: `Sur Proxilio, chaque professionnel est vérifié manuellement avant publication. Consultez les avis laissés après réservation confirmée pour choisir en confiance.` },
            { q: `Peut-on réserver un ${jobName.toLowerCase()} en ligne ?`, a: `Oui. Les professionnels Premium proposent la réservation en ligne directement depuis leur fiche, 24h/24.` },
            { q: `Les avis sont-ils fiables ?`, a: `Oui. Seuls les clients ayant effectué une réservation confirmée peuvent déposer un avis sur Proxilio.` },
          ].map(({ q, a }) => (
            <details key={q} className="group border-b border-black/5 py-4">
              <summary className="cursor-pointer text-sm font-light text-[#132A24] list-none flex items-center justify-between">
                {q}
                <span className="text-[#879f98] group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-3 text-sm font-light text-[#879f98] leading-relaxed">{a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}

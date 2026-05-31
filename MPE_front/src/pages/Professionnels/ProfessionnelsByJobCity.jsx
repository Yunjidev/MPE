import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getData } from "../../services/data-fetch";
import { FaStar } from "react-icons/fa";
import { FiMapPin, FiCalendar } from "react-icons/fi";

function slugToLabel(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfessionnelsByJobCity() {
  const { jobSlug, citySlug } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getData(`enterprises/by-job/${jobSlug}?city=${citySlug}`)
      .then(setData)
      .catch(() => setData({ enterprises: [], jobName: slugToLabel(jobSlug), cities: [] }))
      .finally(() => {
        setLoading(false);
        if (typeof window !== "undefined") window.prerenderReady = true;
      });
  }, [jobSlug, citySlug]);

  const jobName     = data?.jobName || slugToLabel(jobSlug);
  const cityLabel   = slugToLabel(citySlug);
  const enterprises = data?.enterprises || [];

  const title       = `${jobName} à ${cityLabel} — Professionnels vérifiés | Proxilio`;
  const description = `Trouvez un ${jobName.toLowerCase()} à ${cityLabel} vérifié par Proxilio. ${enterprises.length} professionnel${enterprises.length > 1 ? "s" : ""} disponible${enterprises.length > 1 ? "s" : ""} avec avis et réservation en ligne.`;
  const canonical   = `https://proxilio.fr/professionnels/${jobSlug}/${citySlug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://proxilio.fr/" },
      { "@type": "ListItem", position: 2, name: "Professionnels", item: "https://proxilio.fr/professionnels" },
      { "@type": "ListItem", position: 3, name: jobName, item: `https://proxilio.fr/professionnels/${jobSlug}` },
      { "@type": "ListItem", position: 4, name: cityLabel, item: canonical },
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
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-light text-[#879f98]">
          <Link to="/" className="hover:text-[#132A24] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/professionnels" className="hover:text-[#132A24] transition-colors">Professionnels</Link>
          <span>/</span>
          <Link to={`/professionnels/${jobSlug}`} className="hover:text-[#132A24] transition-colors">{jobName}</Link>
          <span>/</span>
          <span className="text-[#132A24]">{cityLabel}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-[#132A24] tracking-tight">
            {jobName} <span className="text-[#879f98]">à {cityLabel}</span>
          </h1>
          <p className="mt-2 text-sm font-light text-[#879f98]">
            {loading ? "Chargement…" : `${enterprises.length} professionnel${enterprises.length > 1 ? "s" : ""} vérifié${enterprises.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-[#f5f7f6] h-40 animate-pulse" />
            ))}
          </div>
        ) : enterprises.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-[#879f98] font-light">Aucun {jobName.toLowerCase()} à {cityLabel} pour l'instant.</p>
            <Link to={`/professionnels/${jobSlug}`} className="inline-block text-sm text-[#132A24] underline underline-offset-4">
              Voir tous les {jobName.toLowerCase()}s en France →
            </Link>
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
                    <p className="text-sm font-light text-[#132A24] truncate">{e.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {e.isPremium && <span className="text-[10px] font-light px-1.5 py-0.5 rounded-full bg-[#132A24] text-white">★ Premium</span>}
                      {e.averageRating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#879f98] font-light">
                          <FaStar className="text-amber-400 text-[10px]" />
                          {e.averageRating.toFixed(1)}
                          {e.reviewCount > 0 && <span>({e.reviewCount} avis)</span>}
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
                {e.isPremium && (
                  <p className="flex items-center gap-1 text-xs font-light text-[#132A24]">
                    <FiCalendar className="flex-shrink-0" />
                    Réservation en ligne disponible
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

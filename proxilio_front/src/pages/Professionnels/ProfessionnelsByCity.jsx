import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getData } from "../../services/data-fetch";
import { FaStar } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";

function slugToLabel(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function jobSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProfessionnelsByCity() {
  const { citySlug } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    setLoading(true);
    setActiveJob(null);
    getData(`enterprises/by-city/${citySlug}`)
      .then(setData)
      .catch(() => setData({ enterprises: [], cityName: slugToLabel(citySlug), jobs: [] }))
      .finally(() => {
        setLoading(false);
        if (typeof window !== "undefined") window.prerenderReady = true;
      });
  }, [citySlug]);

  const cityName   = data?.cityName || slugToLabel(citySlug);
  const allEnterprises = data?.enterprises || [];
  const enterprises = activeJob
    ? allEnterprises.filter((e) => e.job?.name === activeJob)
    : allEnterprises;
  const jobs = data?.jobs || [];

  const title       = `Professionnels à ${cityName} — Proxilio`;
  const description = `Trouvez un professionnel vérifié à ${cityName}. ${allEnterprises.length} prestataire${allEnterprises.length > 1 ? "s" : ""} référencé${allEnterprises.length > 1 ? "s" : ""} sur Proxilio.`;
  const canonical   = `https://proxilio.fr/professionnels/ville/${citySlug}`;

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
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-light text-[#879f98]">
          <Link to="/" className="hover:text-[#132A24] transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/professionnels" className="hover:text-[#132A24] transition-colors">Professionnels</Link>
          <span>/</span>
          <span className="text-[#132A24]">{cityName}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-[#132A24] tracking-tight">
            Professionnels <span className="text-[#879f98]">à {cityName}</span>
          </h1>
          <p className="mt-2 text-sm font-light text-[#879f98]">
            {loading ? "Chargement…" : `${enterprises.length} professionnel${enterprises.length > 1 ? "s" : ""} vérifié${enterprises.length > 1 ? "s" : ""} sur Proxilio`}
          </p>
        </div>

        {/* Filtre par métier */}
        {jobs.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {activeJob && (
              <button
                onClick={() => setActiveJob(null)}
                className="px-3 py-1.5 text-xs font-light rounded-full bg-[#132A24] text-white flex items-center gap-1.5"
              >
                {activeJob} <span>✕</span>
              </button>
            )}
            {jobs.filter((j) => j !== activeJob).map((j) => (
              <button
                key={j}
                onClick={() => setActiveJob(j)}
                className="px-3 py-1.5 text-xs font-light rounded-full border border-black/10 text-[#132A24] hover:bg-[#eef5f1] transition-colors"
              >
                {j}
              </button>
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
            <p className="text-[#879f98] font-light">Aucun professionnel référencé à {cityName} pour l'instant.</p>
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
                    <img src={e.logo} alt={`Logo ${e.name}`} width={48} height={48} loading="lazy"
                      className="w-12 h-12 rounded-xl object-cover border border-black/5 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#eef5f1] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#132A24] text-xl font-light">{e.name?.[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-light text-[#132A24] truncate">{e.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {e.isPremium && (
                        <span className="text-[10px] font-light px-1.5 py-0.5 rounded-full bg-[#132A24] text-white">★ Premium</span>
                      )}
                      {e.job?.name && (
                        <span className="text-[10px] font-light text-[#879f98]">{e.job.name}</span>
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
      </div>
    </>
  );
}

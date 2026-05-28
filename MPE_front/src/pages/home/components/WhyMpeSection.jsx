/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const FALLBACK_LOGO = "/assets/img/logo.png";

const PRINCIPLES = [
  "Créez votre compte et complétez votre fiche entreprise avec vos services, photos et informations professionnelles. Votre profil est ensuite vérifié par notre équipe avant publication.",
  "Partagez votre page et apparaissez dans les recherches locales selon votre métier, votre ville et votre zone d'intervention.",
  "Passez en Premium pour débloquer plus de visibilité, un badge de confiance et des fonctionnalités avancées.",
  "Profitez du système de réservation en ligne, gérez vos disponibilités et recevez vos demandes directement depuis votre espace professionnel.",
];

function EnterpriseCard({ slug, id, name, job, city, logo, rating }) {
  return (
    <Link to={`/enterprise/${slug || id}`} className="flex-shrink-0 w-60 bg-white border border-black/5 rounded-2xl p-4 mx-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.10)] transition-shadow cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={logo || FALLBACK_LOGO}
          alt={name}
          onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
          className="w-10 h-10 rounded-xl object-cover bg-[#f5f7f6] border border-black/5"
        />
        <div className="min-w-0">
          <p className="text-[#132A24] text-sm font-medium truncate tracking-tight">{name}</p>
          <p className="text-[#879f98] text-xs truncate font-light">{job || "—"}</p>
        </div>
        <div className="ml-auto shrink-0 p-1.5 rounded-lg bg-[#eef5f1] border border-[#132A24]/10 text-[#132A24]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#879f98] truncate font-light">{city || "—"}</span>
        {typeof rating === "number" && rating > 0 && (
          <span className="flex items-center gap-1 text-[#274F44] font-semibold">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function WhyMpeSection({ premiumEnterprises }) {
  const base = premiumEnterprises.length > 0
    ? Array.from({ length: Math.ceil(12 / premiumEnterprises.length) }).flatMap(() => premiumEnterprises)
    : [];
  const doubled = [...base, ...base];

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-40 border-t border-black/5">
        <div className="bg-[#eef5f1] border border-black/5 rounded-[2rem] overflow-hidden relative shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] w-full transition-shadow duration-500 hover:shadow-xl pb-10">

          <div className="p-6 sm:p-14 md:p-20 pb-0">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 xl:gap-24">

              <div className="xl:col-span-5 rv-blur">
                <p className="text-sm uppercase tracking-widest text-[#879f98] mb-6 flex items-center gap-2 font-light">
                  <span className="w-6 h-px bg-[#879f98]" /> Entrepreneur ? POURQUOI PROXILIO ?
                </p>
                <h3 className="font-light text-[40px] sm:text-[56px] leading-tight tracking-tight mb-6 text-[#132A24]">
                  Développez votre activité<br />
                  <span className="text-[#274F44]">localement.</span>
                </h3>
                <p className="text-base sm:text-xl text-[#4b615a] font-light leading-relaxed tracking-tight">
                  Une plateforme pensée pour aider les professionnels à gagner en visibilité et trouver de nouveaux clients près de chez eux.
                </p>
              </div>

              <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16 lg:pt-3 w-full">
                {PRINCIPLES.map((txt, i) => (
                  <div key={i} className={`flex gap-5 items-start rv-up rv-d${i + 1} group`}>
                    <span className="text-xl text-[#a5b7b1] font-mono font-light mt-1.5 transition-colors group-hover:text-[#132A24]">
                      0{i + 1}
                    </span>
                    <p className="text-base sm:text-2xl text-[#4b615a] font-light leading-tight transition-transform duration-300 group-hover:translate-x-1 tracking-tight">
                      {txt}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="w-full h-px bg-[#dce7e2] mt-16 sm:mt-24" />

          <div className="relative py-12 sm:py-16 overflow-hidden flex bg-transparent w-full rv-up rv-d2">
            <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#eef5f1] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#eef5f1] to-transparent z-10 pointer-events-none" />

            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-[#879f98] font-light z-20">
              Entreprises Premium
            </p>

            {doubled.length > 0 ? (
              <div
                className="flex w-max hover:[animation-play-state:paused]"
                style={{ animation: "marqueeLeft 60s linear infinite" }}
              >
                {doubled.map((e, i) => (
                  <EnterpriseCard
                    key={i}
                    id={e.id}
                    slug={e.slug}
                    name={e.name}
                    job={e.job?.name}
                    city={e.city}
                    logo={e.logo}
                    rating={e.averageRating}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-4 px-8 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-60 h-20 bg-white border border-black/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            )}
          </div>

        </div>
    </section>
  );
}

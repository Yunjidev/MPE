/* eslint-disable react/prop-types */
import indexcards from '../../../public/assets/img/indexcards.jpg';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikesForCards/LikeButton';

const IndexCardsEntreprises = ({ entreprise, userId }) => {
  const navigate = useNavigate();
  const {
    id,
    slug,
    name,
    city,
    zip_code,
    job,
    nextAvailableDate,
    logo,
    averageRating,
    isPremium,
  } = entreprise;

  const jobName = job?.name || 'Métier non spécifié';
  const nextDateDisplay = nextAvailableDate
    ? `${nextAvailableDate.date} · ${nextAvailableDate.startHour}–${nextAvailableDate.endHour}`
    : null;

  const goTo = () => navigate(`/enterprise/${slug || id}`);

  return (
    <div
      onClick={goTo}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-black/5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Like button */}
      <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
        <LikeButton userId={userId} enterpriseId={id} />
      </div>

      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-3 left-3 z-20">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#132A24] text-white text-[10px] font-light tracking-wide">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            Premium
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={logo || indexcards}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = indexcards; }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <h2 className="text-base font-light text-[#132A24] leading-tight line-clamp-1 tracking-tight mb-1">
          {name}
        </h2>

        {/* Job + rating row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eef5f1] text-[#132A24] text-xs font-light tracking-tight">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            {jobName}
          </span>
          {typeof averageRating === 'number' && (
            <span className="flex items-center gap-1 text-xs text-[#132A24] font-light">
              <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-sm text-[#4b615a] font-light">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-9.5 11.25S.5 17.642.5 10.5a9.5 9.5 0 1119 0z" />
            </svg>
            <span className="truncate">{city ? `${city}${zip_code ? `, ${zip_code}` : ''}` : 'Localisation indisponible'}</span>
          </div>
          {nextDateDisplay && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              <span className="truncate">{nextDateDisplay}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); goTo(); }}
          className="mt-4 w-full h-9 rounded-full border border-[#132A24]/15 text-[#132A24] text-sm font-light hover:bg-[#132A24] hover:text-white hover:border-[#132A24] transition-all duration-200"
        >
          Voir la fiche
        </button>
      </div>
    </div>
  );
};

export default IndexCardsEntreprises;

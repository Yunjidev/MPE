/* eslint-disable react/prop-types */
import { FiCalendar, FiClock } from "react-icons/fi";

const formatDurationLabel = (minutes) => {
  const total = Number(minutes) || 0;
  if (total >= 60) {
    const hours = Math.floor(total / 60);
    const remainder = total % 60;
    const hourLabel = hours > 1 ? "heures" : "heure";
    return remainder > 0 ? `${hours} ${hourLabel} ${remainder} min` : `${hours} ${hourLabel}`;
  }
  return `${total} min`;
};

const createMarkup = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return { __html: txt.value };
};

const OfferList = ({ offers, onBook }) => {
  if (!offers?.length) {
    return (
      <div className="rounded-2xl border border-black/5 bg-[#f5f7f6] p-10 text-center text-[#879f98] text-sm font-light">
        Aucune prestation disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {offers.map((offer) => (
        <div
          key={offer.id || offer.name}
          className="bg-white border border-black/5 rounded-2xl p-5 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] transition-shadow flex flex-col gap-4"
        >
          {/* Header: image + title + price */}
          <div className="flex items-start gap-3">
            {offer.image ? (
              <img
                src={offer.image}
                alt={offer.name}
                className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-black/5"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center flex-shrink-0">
                <FiClock className="text-[#132A24] text-2xl" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-light text-[#132A24] text-base leading-snug tracking-tight">{offer.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#132A24] font-light text-sm">
                  {offer.price ? `${offer.price} €` : "Devis sur demande"}
                </span>
                <span className="text-[#879f98]/40">•</span>
                <span className="flex items-center gap-1 text-xs text-[#879f98]">
                  <FiClock className="text-xs" />
                  {formatDurationLabel(offer.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <div
              className="text-sm text-[#4b615a] font-light leading-relaxed line-clamp-3"
              dangerouslySetInnerHTML={createMarkup(offer.description)}
            />
          )}

          {/* CTA */}
          <div className="mt-auto pt-1">
            {onBook ? (
              <button
                onClick={() => onBook(offer)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
              >
                <FiCalendar className="text-sm" />
                Réserver ce service
              </button>
            ) : (
              <p className="text-xs text-[#879f98] font-light text-center py-1">
                Réservation directement en agence
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfferList;

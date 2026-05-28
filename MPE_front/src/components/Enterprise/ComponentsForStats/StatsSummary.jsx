/* eslint-disable react/prop-types */
import AverageRating from "./AverageRating";
import Comments from "./Comments";
import TotalReservations from "./TotalReservations";
import OffersCount from "./OffersCount";
import UpcomingWeek from "./UpcomingWeek";
import GraphForView from "./GraphForView";
import CommentsList from "./CommentsList";
import Likes from "./Likes";
import PremiumStats from "./PremiumStats";

function getArray(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}
function getNumber(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return 0;
}

function computeMetrics(enterprise) {
  const offers = getArray(enterprise, "offers", "services", "products");

  const totalReservations = offers.reduce((acc, o) => {
    const res = getArray(o, "reservations", "bookings", "appointments");
    return acc + res.length;
  }, 0);

  const totalComments = offers.reduce((acc, o) => {
    const ratings = getArray(o, "ratings", "notes", "reviews", "comments");
    return acc + ratings.length;
  }, 0);

  const averageRating = getNumber(enterprise, "averageRating", "average_note", "avgRating");
  const offersCount = offers.length;

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const upcoming7 = offers.reduce((acc, o) => {
    const res = getArray(o, "reservations", "bookings", "appointments");
    const cnt = res.filter((r) => {
      const d = r?.date ? new Date(r.date) : null;
      return d && d >= now && d <= in7;
    }).length;
    return acc + cnt;
  }, 0);

  return { totalReservations, totalComments, averageRating, offersCount, upcoming7 };
}

export default function StatsSummary({ enterprise, onPremiumRevoked }) {
  if (!enterprise) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6 text-[#879f98] font-light text-sm">
        Chargement des statistiques…
      </div>
    );
  }

  const offers = getArray(enterprise, "offers", "services", "products");
  const { totalReservations, totalComments, averageRating, offersCount, upcoming7 } = computeMetrics(enterprise);

  return (
    <>
      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Vue d&apos;ensemble</p>
            <h2 className="text-base font-light text-[#132A24]">Statistiques</h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OffersCount count={offersCount} />
            <TotalReservations count={totalReservations} />
            <AverageRating averageRating={averageRating} />
            <Comments totalComments={totalComments} />
            <UpcomingWeek count={upcoming7} />
            <Likes enterpriseId={enterprise.id} />
          </div>

          <div className="flex-1 min-w-[280px]">
            <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] h-full p-5">
              <GraphForView reservations={offers.flatMap((o) => getArray(o, "reservations", "bookings", "appointments"))} />
            </div>
          </div>
        </div>
      </div>

      {enterprise.isPremium && (
        <div className="w-full mt-6">
          <PremiumStats enterprise={enterprise} onPremiumRevoked={onPremiumRevoked} />
        </div>
      )}

      <div className="w-full mt-6">
        <CommentsList enterprise={enterprise} />
      </div>
    </>
  );
}

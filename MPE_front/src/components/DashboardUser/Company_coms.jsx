/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { getData } from "../../services/data-fetch";
import { FaStar } from "react-icons/fa";

const CommentsOfUser = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentsAndOffers = async () => {
      try {
        const userProfile = await getData("user/profile");
        const ratings = userProfile?.ratings || [];
        const enriched = ratings.map((rating) => ({
          ...rating,
          offer: userProfile?.reservations?.find(
            (r) => Number(r.Offer_id) === Number(rating.Offer_id)
          )?.offer || {},
        }));
        setReservations(enriched);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommentsAndOffers();
  }, []);

  if (loading) {
    return <p className="text-sm text-[#879f98] font-light">Chargement des commentaires…</p>;
  }

  if (!reservations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#eef5f1] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>
        <p className="text-sm text-[#879f98] font-light">Vous n&apos;avez pas encore laissé d&apos;avis.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reservations.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1]/50 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#879f98] font-light mb-0.5">
                {r.offer?.enterprise?.name ?? "Entreprise inconnue"}
              </p>
              <h3 className="text-sm font-light text-[#132A24] tracking-tight">
                {r.offer?.name ?? "Offre inconnue"}
              </h3>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0 self-start">
              <FaStar className="text-amber-400 text-xs" />
              <span className="text-xs font-light text-amber-700">{Number(r.note ?? 0).toFixed(1)}</span>
            </div>
          </div>

          {r.comment ? (
            <p className="mt-3 text-sm text-[#4b615a] font-light leading-relaxed">
              &ldquo;{r.comment}&rdquo;
            </p>
          ) : (
            <p className="mt-3 text-xs text-[#879f98] font-light italic">
              Aucun commentaire renseigné.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CommentsOfUser;

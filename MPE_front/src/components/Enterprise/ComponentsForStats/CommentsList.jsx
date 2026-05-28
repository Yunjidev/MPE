/* eslint-disable react/prop-types */
import { FaStar } from "react-icons/fa";

export default function CommentsList({ enterprise }) {
  if (!enterprise) return null;

  const commentsData = (enterprise.offers || []).flatMap((offer) =>
    (offer.ratings || []).map((rating) => ({
      username: rating?.user?.username ?? "Anonyme",
      comment: rating?.comment ?? "",
      rating: Number(rating?.note ?? 0),
      offerName: offer?.name ?? "—",
    }))
  );

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Retours clients</p>
          <h2 className="text-base font-light text-[#132A24]">Avis et Notes</h2>
        </div>
        <span className="text-xs text-[#879f98] font-light">{commentsData.length} avis</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-black/5">
              <th className="px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light">Offre</th>
              <th className="px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light">Client</th>
              <th className="px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light">Commentaire</th>
              <th className="px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light">Note</th>
            </tr>
          </thead>
          <tbody>
            {commentsData.map((c, idx) => (
              <tr key={idx} className="border-b border-black/5 hover:bg-[#f5f7f6] transition">
                <td className="px-4 py-3 text-sm font-light text-[#132A24]">{c.offerName}</td>
                <td className="px-4 py-3 text-sm font-light text-[#4b615a]">{c.username}</td>
                <td className="px-4 py-3 text-sm font-light text-[#4b615a] max-w-[480px] break-words">
                  {c.comment || <span className="text-[#879f98]">—</span>}
                </td>
                <td className="px-4 py-3 text-sm font-light text-[#132A24]">
                  <span className="inline-flex items-center gap-1.5">
                    <FaStar className="text-amber-400 w-3.5 h-3.5" /> {c.rating.toFixed(1)}/5
                  </span>
                </td>
              </tr>
            ))}
            {commentsData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#879f98] text-sm font-light">
                  Pas encore d&apos;avis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

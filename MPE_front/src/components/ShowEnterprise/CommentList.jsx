/* eslint-disable react/prop-types */
import { useState } from "react";

const COMMENTS_PER_PAGE = 6;

const Stars = ({ note }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < parseInt(note, 10) ? "text-amber-400" : "text-black/10"}`}>
        ★
      </span>
    ))}
  </div>
);

const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-light border transition-colors ${
      active
        ? "bg-[#132A24] text-white border-[#132A24]"
        : "bg-[#f5f7f6] text-[#879f98] border-black/5 hover:border-[#132A24]/20 hover:text-[#132A24]"
    }`}
  >
    {children}
  </button>
);

const CommentList = ({ offers }) => {
  const [page, setPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent");

  const allComments = offers.flatMap((offer) => offer.ratings);

  const filtered = selectedRating
    ? allComments.filter((c) => parseInt(c.note) === selectedRating)
    : allComments;

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "best")  return b.note - a.note;
    if (sortOrder === "worst") return a.note - b.note;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / COMMENTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = sorted.slice((safePage - 1) * COMMENTS_PER_PAGE, safePage * COMMENTS_PER_PAGE);

  const handleFilter = (rating) => { setSelectedRating(rating); setPage(1); };
  const handleSort = (value) => { setSortOrder(value); setPage(1); };

  return (
    <div className="space-y-6">

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm border border-black/5 bg-[#f5f7f6] text-[#132A24] rounded-xl px-3 py-2 font-light focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 transition-colors cursor-pointer"
        >
          <option value="recent">Les plus récents</option>
          <option value="best">Meilleures notes</option>
          <option value="worst">Notes les plus basses</option>
        </select>

        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={selectedRating === null} onClick={() => handleFilter(null)}>
            Tous
          </FilterPill>
          {[5, 4, 3, 2, 1].map((r) => (
            <FilterPill key={r} active={selectedRating === r} onClick={() => handleFilter(r)}>
              {r} ★
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Comments grid */}
      {slice.length === 0 ? (
        <p className="text-center text-[#879f98] font-light text-sm py-10">Aucun avis pour le moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((rating, i) => (
            <div
              key={i}
              className="bg-white border border-black/5 rounded-2xl p-5 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-shadow flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    rating.user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(rating.user?.username || "U")}&background=eef5f1&color=132A24&size=40`
                  }
                  alt={rating.user?.username}
                  className="h-10 w-10 rounded-full object-cover border border-black/5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-light text-[#132A24] tracking-tight">
                    {rating.user?.username || "Utilisateur"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Stars note={rating.note} />
                    <span className="text-xs text-[#879f98]">{rating.note}/5</span>
                  </div>
                </div>
              </div>

              {rating.comment && (
                <p className="text-sm text-[#4b615a] font-light flex-1 leading-relaxed">
                  &ldquo;{rating.comment}&rdquo;
                </p>
              )}

              <span className="text-xs text-[#879f98] font-light">
                {new Date(rating.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-black/5 bg-[#f5f7f6] text-[#879f98] text-sm font-light rounded-xl hover:bg-[#eef5f1] hover:text-[#132A24] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <span className="text-sm text-[#879f98] font-light">
            Page {safePage} / {totalPages}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-black/5 bg-[#f5f7f6] text-[#879f98] text-sm font-light rounded-xl hover:bg-[#eef5f1] hover:text-[#132A24] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;

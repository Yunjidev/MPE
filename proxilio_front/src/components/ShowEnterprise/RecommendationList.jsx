/* eslint-disable react/prop-types */
import { useState } from "react";
import { toast } from "react-toastify";
import { postData, deleteData } from "../../services/data-fetch";

const PER_PAGE = 6;

const RecommendationList = ({ recommendations: initial, enterpriseSlug, currentUser, onUpdate }) => {
  const [recommendations, setRecommendations] = useState(initial || []);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasRecommended = currentUser?.isLogged
    ? recommendations.some((r) => r.User_id === currentUser.id)
    : false;

  const sorted = [...recommendations].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim().length < 10) {
      toast.error("La recommandation doit faire au moins 10 caractères.");
      return;
    }
    try {
      setSubmitting(true);
      const created = await postData(`enterprise/${enterpriseSlug}/recommendation`, { content });
      setRecommendations((prev) => [created, ...prev]);
      setContent("");
      toast.success("Recommandation publiée !");
      if (onUpdate) onUpdate();
    } catch (err) {
      try { toast.error(JSON.parse(err.message).errors || "Erreur lors de l'envoi."); }
      catch { toast.error("Erreur lors de l'envoi."); }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteData(`recommendation/${id}`);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recommandation supprimée.");
      if (onUpdate) onUpdate();
    } catch {
      toast.error("Impossible de supprimer la recommandation.");
    }
  };

  return (
    <div className="space-y-8">

      {/* Form — logged in and hasn't recommended yet */}
      {currentUser?.isLogged && !hasRecommended && (
        <div className="bg-[#f5f7f6] border border-black/5 rounded-2xl p-5">
          <h3 className="text-sm font-light text-[#132A24] mb-3">Recommander cette entreprise</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Partagez votre expérience ou pourquoi vous recommandez ce professionnel…"
              required
              className="w-full rounded-xl bg-white border border-black/5 px-3 py-2.5 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#879f98] font-light">{content.length} / 1000</span>
              <button
                type="submit"
                disabled={submitting || content.trim().length < 10}
                className="px-5 py-2.5 rounded-xl bg-[#132A24] text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60"
              >
                {submitting ? "Publication…" : "Publier la recommandation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Already recommended badge */}
      {currentUser?.isLogged && hasRecommended && (
        <div className="flex items-center gap-2 bg-[#eef5f1] border border-[#132A24]/10 rounded-xl px-4 py-3 text-sm text-[#132A24] font-light">
          <span>✓</span>
          <span>Vous avez déjà recommandé cette entreprise.</span>
        </div>
      )}

      {/* Not logged in */}
      {!currentUser?.isLogged && (
        <div className="bg-[#f5f7f6] border border-black/5 rounded-2xl p-5 text-center space-y-3">
          <p className="text-sm font-light text-[#879f98]">
            Connectez-vous pour recommander ce professionnel.
          </p>
          <a
            href={`/signin?redirect=${encodeURIComponent(window.location.pathname)}`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#132A24] text-sm font-light text-white hover:bg-[#1b3b33] transition"
          >
            Se connecter
          </a>
        </div>
      )}

      {/* List */}
      {slice.length === 0 ? (
        <p className="text-center text-[#879f98] font-light text-sm py-10">
          Aucune recommandation pour le moment.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-black/5 rounded-2xl p-5 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-shadow flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      rec.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.user?.username || "U")}&background=eef5f1&color=132A24&size=40`
                    }
                    alt={rec.user?.username}
                    className="h-10 w-10 rounded-full object-cover border border-black/5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-light text-[#132A24] tracking-tight truncate">
                      {rec.user?.username || "Utilisateur"}
                    </p>
                    <p className="text-xs text-[#879f98] font-light">
                      {new Date(rec.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {currentUser?.isLogged && rec.User_id === currentUser.id && (
                  <button
                    onClick={() => handleDelete(rec.id)}
                    title="Supprimer ma recommandation"
                    className="flex-shrink-0 text-[#879f98] hover:text-red-500 transition text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-sm text-[#4b615a] font-light flex-1 leading-relaxed">
                &ldquo;{rec.content}&rdquo;
              </p>
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

export default RecommendationList;

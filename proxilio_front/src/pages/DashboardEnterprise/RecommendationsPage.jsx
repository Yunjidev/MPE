import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoTrashOutline, IoPersonOutline } from "react-icons/io5";
import { FiThumbsUp } from "react-icons/fi";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export default function RecommendationsPage() {
  const { slug } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getData(`enterprise/${slug}/recommendations`);
      setRecommendations(data || []);
    } catch {
      toast.error("Impossible de charger les recommandations.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette recommandation ?")) return;
    try {
      setDeleting(id);
      await deleteData(`enterprise/${slug}/recommendations/${id}`);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recommandation supprimée.");
    } catch {
      toast.error("Impossible de supprimer cette recommandation.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#132A24] tracking-tight">Recommandations</h1>
        <p className="text-sm text-[#879f98] font-light mt-1">
          {recommendations.length > 0
            ? `${recommendations.length} recommandation${recommendations.length > 1 ? "s" : ""} reçue${recommendations.length > 1 ? "s" : ""}`
            : "Aucune recommandation pour le moment"}
        </p>
      </div>

      {/* Explainer */}
      <div className="bg-[#eef5f1] border border-[#132A24]/10 rounded-2xl px-5 py-4 flex gap-4">
        <FiThumbsUp className="text-[#132A24] text-xl flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-light text-[#132A24] leading-relaxed">
            Les recommandations sont des témoignages laissés par des personnes qui vous connaissent professionnellement — anciens clients, partenaires ou collaborateurs — qu&apos;ils aient ou non réservé via Proxilio.
          </p>
          <p className="text-sm font-light text-[#879f98] leading-relaxed">
            Pour en recevoir, il suffit que la personne ait un compte Proxilio. Elle peut laisser une recommandation directement depuis votre fiche publique, dans l&apos;onglet <strong className="text-[#132A24] font-normal">Recommandations</strong>.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 rounded-full border-2 border-[#132A24]/20 border-t-[#132A24] animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <IoPersonOutline className="mx-auto text-4xl text-[#879f98]/40" />
          <p className="text-sm text-[#879f98] font-light">
            Vous n&apos;avez pas encore reçu de recommandation.
          </p>
          <p className="text-xs text-[#879f98] font-light">
            Partagez votre fiche publique pour en recevoir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-black/5 rounded-2xl p-5 flex gap-4 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-shadow"
            >
              {/* Avatar */}
              <img
                src={
                  rec.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.user?.username || "U")}&background=eef5f1&color=132A24&size=40`
                }
                alt={rec.user?.username}
                className="h-10 w-10 rounded-full object-cover border border-black/5 flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-light text-[#132A24] tracking-tight">
                      {rec.user?.username || "Utilisateur"}
                    </p>
                    <p className="text-xs text-[#879f98] font-light">{fmtDate(rec.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    disabled={deleting === rec.id}
                    title="Supprimer"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/5 text-[#879f98] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors text-xs font-light disabled:opacity-40"
                  >
                    <IoTrashOutline className="text-sm" />
                    Supprimer
                  </button>
                </div>
                <p className="text-sm text-[#4b615a] font-light leading-relaxed">
                  &ldquo;{rec.content}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

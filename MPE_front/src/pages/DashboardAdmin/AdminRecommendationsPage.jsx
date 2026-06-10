import { useState, useEffect, useCallback } from "react";
import { getData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoTrashOutline, IoSearchOutline } from "react-icons/io5";
import { FiThumbsUp } from "react-icons/fi";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

export default function AdminRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getData("admin/recommendations");
      setRecommendations(data || []);
    } catch {
      toast.error("Impossible de charger les recommandations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette recommandation ?")) return;
    try {
      setDeleting(id);
      await deleteData(`admin/recommendations/${id}`);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recommandation supprimée.");
    } catch {
      toast.error("Impossible de supprimer.");
    } finally {
      setDeleting(null);
    }
  };

  const q = search.toLowerCase().trim();
  const filtered = q
    ? recommendations.filter(
        (r) =>
          r.enterprise?.name?.toLowerCase().includes(q) ||
          r.user?.username?.toLowerCase().includes(q) ||
          r.content?.toLowerCase().includes(q)
      )
    : recommendations;

  // Stats
  const totalEnterprises = new Set(recommendations.map((r) => r.Enterprise_id)).size;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Administration</p>
        <h1 className="text-xl font-light text-[#132A24] tracking-tight">Recommandations</h1>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Total</p>
            <p className="text-2xl font-light text-[#132A24]">{recommendations.length}</p>
            <p className="text-xs text-[#879f98] font-light">recommandations</p>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprises</p>
            <p className="text-2xl font-light text-[#132A24]">{totalEnterprises}</p>
            <p className="text-xs text-[#879f98] font-light">ont reçu des recommandations</p>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-1 col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Ce mois</p>
            <p className="text-2xl font-light text-[#132A24]">
              {recommendations.filter((r) => {
                const d = new Date(r.createdAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-[#879f98] font-light">ajoutées ce mois-ci</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98] text-base" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par entreprise, utilisateur ou contenu…"
          className="w-full rounded-xl bg-white border border-black/5 pl-9 pr-4 py-2.5 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-[#132A24]/20 border-t-[#132A24] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <FiThumbsUp className="mx-auto text-4xl text-[#879f98]/30" />
          <p className="text-sm text-[#879f98] font-light">
            {search ? "Aucun résultat pour cette recherche." : "Aucune recommandation pour le moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
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
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-light text-[#132A24]">{rec.user?.username || "—"}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#879f98] font-light">{fmtDate(rec.createdAt)}</span>
                      <span className="text-[#879f98]/40 text-xs">·</span>
                      <a
                        href={`/enterprise/${rec.enterprise?.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#132A24] font-light underline underline-offset-2 decoration-[#132A24]/20 hover:decoration-[#132A24] transition-colors truncate max-w-[200px]"
                      >
                        {rec.enterprise?.name || "—"}
                      </a>
                    </div>
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
          {search && filtered.length !== recommendations.length && (
            <p className="text-xs text-center text-[#879f98] font-light pt-2">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur {recommendations.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

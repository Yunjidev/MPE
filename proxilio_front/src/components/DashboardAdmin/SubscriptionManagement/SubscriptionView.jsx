import { useState, useEffect } from "react";
import { FaEye, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getSubscription, deleteSubscription, updateSubscription } from "./FunctionForSubscription";
import { toast } from "react-toastify";

const TYPE_LABELS = { forever: "À vie", monthly: "Mensuel", yearly: "Annuel" };
const STATUS_LABELS = { active: "Actif", inactive: "Inactif" };

const statusBadge = (status) =>
  status === "active"
    ? "bg-[#eef5f1] text-[#132A24] border-[#132A24]/15"
    : "bg-black/5 text-[#879f98] border-black/5";

const typeBadge = (type) =>
  type === "forever"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-blue-50 text-blue-600 border-blue-200";

function SubscriptionRow({ subscription, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(subscription.subscription_type || "monthly");
  const [status, setStatus] = useState(subscription.status || "active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(subscription.id, { subscription_type: type, status });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const selectCls = "rounded-lg border border-black/5 bg-white px-2 py-1.5 text-sm text-[#132A24] font-light focus:border-[#132A24]/30 focus:outline-none";

  return (
    <div className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Logo + nom */}
        <div className="flex items-center gap-3 sm:w-52 flex-shrink-0">
          {subscription.enterprise.logo ? (
            <img
              src={subscription.enterprise.logo}
              alt={subscription.enterprise.name}
              className="w-10 h-10 rounded-xl border border-black/5 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl border border-black/5 bg-white flex items-center justify-center text-[#879f98] flex-shrink-0 text-xs font-light">
              {subscription.enterprise.name?.[0]?.toUpperCase()}
            </div>
          )}
          <p className="text-sm font-light text-[#132A24] truncate">{subscription.enterprise.name || "—"}</p>
        </div>

        {/* Infos */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Type</p>
            {editing ? (
              <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
                <option value="forever">À vie</option>
              </select>
            ) : (
              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-light ${typeBadge(subscription.subscription_type)}`}>
                {TYPE_LABELS[subscription.subscription_type] || subscription.subscription_type}
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Statut</p>
            {editing ? (
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            ) : (
              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-light ${statusBadge(subscription.status)}`}>
                {STATUS_LABELS[subscription.status] || subscription.status}
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Début</p>
            <p className="font-light text-[#4b615a]">{new Date(subscription.start_date).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Fin</p>
            <p className="font-light text-[#4b615a]">{new Date(subscription.end_date).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#132A24]/15 bg-[#eef5f1] text-[#132A24] hover:bg-[#132A24] hover:text-white transition text-xs font-light disabled:opacity-50"
              >
                <FaCheck className="w-3 h-3" /> Sauvegarder
              </button>
              <button
                onClick={() => setEditing(false)}
                className="h-8 w-8 rounded-lg border border-black/5 bg-white flex items-center justify-center text-[#879f98] hover:text-[#132A24] transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(`/enterprise/${subscription.enterprise.slug || subscription.enterprise.id}`)}
                className="h-8 w-8 rounded-lg border border-black/5 bg-white flex items-center justify-center text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition"
                title="Voir l'entreprise"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditing(true)}
                className="h-8 w-8 rounded-lg border border-black/5 bg-white flex items-center justify-center text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition"
                title="Modifier"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(subscription.id)}
                className="h-8 w-8 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition"
                title="Supprimer"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const SubscriptionView = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    getSubscription()
      .then(setSubscriptions)
      .catch((e) => console.error("Failed to fetch subscriptions", e))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deleteSubscription(id)
      .then(() => {
        toast.success("Abonnement supprimé");
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      })
      .catch(() => toast.error("Erreur lors de la suppression"));
  };

  const handleUpdate = (id, data) =>
    updateSubscription(id, data).then(() => {
      toast.success("Abonnement mis à jour");
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
    }).catch(() => toast.error("Erreur lors de la mise à jour"));

  const filtered = subscriptions.filter((s) => {
    const matchSearch = s.enterprise?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  if (loading) {
    return <p className="text-sm text-[#879f98] font-light py-6">Chargement…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher une entreprise…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
          className="flex-1 rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2.5 text-sm text-[#132A24] placeholder:text-[#879f98] font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition"
        />
        <div className="flex gap-1.5">
          {[
            { value: "all", label: "Tous" },
            { value: "active", label: "Actifs" },
            { value: "inactive", label: "Inactifs" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilterStatus(f.value); setPageIndex(0); }}
              className={`rounded-full px-3 py-1.5 text-xs font-light border transition ${
                filterStatus === f.value
                  ? "bg-[#132A24] text-white border-[#132A24]"
                  : "border-black/10 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-10 text-center text-sm text-[#879f98] font-light">
          Aucun abonnement trouvé.
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
            className="h-9 px-4 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#eef5f1] disabled:opacity-40 transition text-sm"
          >
            Précédent
          </button>
          <span className="text-xs text-[#879f98] font-light">
            Page {pageIndex + 1} / {pageCount || 1} · {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setPageIndex((p) => Math.min(p + 1, pageCount - 1))}
            disabled={pageIndex >= pageCount - 1}
            className="h-9 px-4 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#eef5f1] disabled:opacity-40 transition text-sm"
          >
            Suivant
          </button>
        </div>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
          className="rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:outline-none"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
        </select>
      </div>
    </div>
  );
};

export default SubscriptionView;

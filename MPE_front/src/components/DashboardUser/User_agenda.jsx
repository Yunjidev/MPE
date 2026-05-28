/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getData, putData, postData } from "../../services/data-fetch";
import "./user_agenda.css";
import { CiCalendar, CiClock2 } from "react-icons/ci";
import { FaHourglassStart, FaCheck, FaTimes, FaBan, FaCheckCircle } from "react-icons/fa";

const pill = {
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  accepted:  "bg-[#eef5f1] text-[#132A24] border border-[#132A24]/20",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
  rejected:  "bg-black/5 text-[#879f98] border border-black/10",
  done:      "bg-blue-50 text-blue-600 border border-blue-200",
};

const STATUS_OPTIONS = [
  { value: "all",       label: "Toutes" },
  { value: "pending",   label: "En attente" },
  { value: "accepted",  label: "Validée" },
  { value: "done",      label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
  { value: "rejected",  label: "Rejetée" },
];

const UserAgenda = () => {
  const [reservations, setReservations]           = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [statusFilter, setStatusFilter]           = useState("all");
  const [showAll, setShowAll]                     = useState(false);
  const [error, setError]                         = useState(null);
  const [showRatingModal, setShowRatingModal]     = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [ratingSubmitting, setRatingSubmitting]   = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await getData("user/profile");
        const ratings = data?.ratings || [];
        const ratedOfferIds = new Set(ratings.map((r) => Number(r?.Offer_id || r?.offer?.id)));
        const sorted = data?.reservations
          ?.slice()
          ?.map((r) => ({
            ...r,
            hasUserRating: ratedOfferIds.has(Number(r?.Offer_id || r?.offer?.id || r?.offer?.Offer_id)),
          }))
          ?.sort((a, b) => {
            const dA = new Date(`${a.date}T${a.start_time || "00:00"}`);
            const dB = new Date(`${b.date}T${b.start_time || "00:00"}`);
            return dB - dA;
          }) || [];
        setReservations(sorted);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger vos réservations pour le moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, []);

  const cancelReservation = async (id, currentStatus) => {
    if (currentStatus === "done") { toast.info("Impossible d'annuler une réservation terminée."); return; }
    try {
      await putData(`reservation/${id}`, { status: "cancelled" });
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
      toast.success("Réservation annulée.");
    } catch (e) {
      let msg = "Impossible d'annuler cette réservation.";
      try { const p = JSON.parse(e.message); if (p?.errors) msg = typeof p.errors === "string" ? p.errors : p.errors.join("\n"); } catch {}
      toast.error(msg);
    }
  };

  const handleSubmitRating = async ({ note, comment }) => {
    if (!selectedReservation?.offer?.id) { toast.error("Offre introuvable."); return; }
    setRatingSubmitting(true);
    try {
      await postData(`offer/${selectedReservation.offer.id}/rating`, { note: Number(note), comment });
      toast.success("Merci pour votre avis !");
      setReservations((prev) => prev.map((r) => r.id === selectedReservation.id ? { ...r, hasUserRating: true } : r));
      setShowRatingModal(false);
      setSelectedReservation(null);
    } catch (e) {
      let msg = "Impossible d'enregistrer votre avis.";
      try { const p = JSON.parse(e.message); if (p?.errors) msg = typeof p.errors === "string" ? p.errors : p.errors.join("\n"); } catch {}
      toast.error(msg);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const filtered = statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter);
  const displayed = showAll ? filtered : filtered.slice(0, 5);
  const hasMore = filtered.length > displayed.length;

  return (
    <div>
      {loading ? (
        <p className="text-sm text-[#879f98] font-light">Chargement…</p>
      ) : error ? (
        <p className="text-sm text-red-500 font-light text-center">{error}</p>
      ) : (
        <>
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Filtrer :</span>
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setShowAll(false); }}
                  className={`rounded-full px-3 py-1 text-xs font-light border transition-colors ${
                    active
                      ? "bg-[#132A24] text-white border-[#132A24]"
                      : "border-black/5 text-[#879f98] bg-[#f5f7f6] hover:border-[#132A24]/20 hover:text-[#132A24]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eef5f1] flex items-center justify-center">
                <CiCalendar className="text-[#879f98] text-xl" />
              </div>
              <p className="text-sm text-[#879f98] font-light">Aucune réservation avec ce statut.</p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {displayed.map((r) => (
                  <ReservationItem
                    key={r.id}
                    reservation={r}
                    onCancel={cancelReservation}
                    onOpenRating={(res) => { setSelectedReservation(res); setShowRatingModal(true); }}
                  />
                ))}
              </ul>
              {hasMore && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs font-light text-[#4b8a74] hover:text-[#132A24] underline underline-offset-4 transition-colors"
                  >
                    Voir toutes les réservations ({filtered.length})
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showRatingModal && selectedReservation && (
        <RatingModal
          reservation={selectedReservation}
          onClose={() => { setShowRatingModal(false); setSelectedReservation(null); }}
          onSubmit={handleSubmitRating}
          submitting={ratingSubmitting}
        />
      )}
    </div>
  );
};

const ReservationItem = ({ reservation, onCancel, onOpenRating }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const translateStatus = (s) => ({
    pending: "En attente", accepted: "Acceptée", cancelled: "Annulée",
    rejected: "Rejetée", done: "Terminée",
  }[s] ?? s);

  const getStatusIcon = (s) => ({
    pending: <FaHourglassStart className="text-xs" />,
    accepted: <FaCheck className="text-xs" />,
    cancelled: <FaTimes className="text-xs" />,
    rejected: <FaBan className="text-xs" />,
    done: <FaCheckCircle className="text-xs" />,
  }[s] ?? null);

  const formatDuration = (min) => {
    const h = Math.floor((min ?? 0) / 60);
    const m = (min ?? 0) % 60;
    return `${h > 0 ? `${h}h` : ""}${h && m ? " " : ""}${m ? `${m}m` : ""}` || "—";
  };

  const formatTime = (t) => (t ? String(t).substring(0, 5) : "");

  const description = reservation?.offer?.description ?? "";
  const truncated = description.length > 80 ? `${description.slice(0, 80)}…` : description;

  const canCancel = !["done", "cancelled", "rejected"].includes(reservation.status);
  const canRate = reservation.status === "done" && !reservation.hasUserRating;

  const startDate = reservation.date ? new Date(reservation.date) : null;
  if (startDate && !Number.isNaN(startDate.getTime()) && reservation.start_time) {
    const [h, m] = reservation.start_time.split(":");
    startDate.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  }
  const formattedDate = startDate && !Number.isNaN(startDate.getTime())
    ? startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "Date inconnue";

  return (
    <li className="rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-4 hover:bg-white hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Date & heure */}
        <div className="flex items-center gap-4 text-sm text-[#4b615a] font-light">
          <span className="flex items-center gap-1.5">
            <CiCalendar className="text-[#879f98]" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <CiClock2 className="text-[#879f98]" />
            {formatTime(reservation.start_time)}
          </span>
        </div>

        {/* Entreprise / Offre */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
            {reservation?.offer?.enterprise?.name ?? "Entreprise"}
          </p>
          <p className="text-sm font-light text-[#132A24] tracking-tight truncate">
            {reservation?.offer?.name ?? "Offre inconnue"}
          </p>
          {reservation.contact_phone && (
            <p className="text-xs text-[#879f98] font-light mt-0.5">
              Tél. transmis : {reservation.contact_phone}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0 text-sm text-[#4b615a] font-light">
          <p className="line-clamp-2 lg:line-clamp-1">
            {showFullDescription ? description : truncated}
            {description.length > 80 && (
              <button
                onClick={() => setShowFullDescription((v) => !v)}
                className="ml-2 text-xs text-[#4b8a74] hover:text-[#132A24] underline"
              >
                {showFullDescription ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </p>
        </div>

        {/* Statut */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light ${pill[reservation.status] ?? "bg-black/5 text-[#879f98] border border-black/10"}`}>
          {getStatusIcon(reservation.status)}
          {translateStatus(reservation.status)}
        </div>

        {/* Durée & prix */}
        <div className="flex items-center gap-2 text-sm text-[#4b615a] font-light flex-shrink-0">
          <span>{formatDuration(reservation?.offer?.duration)}</span>
          <span className="text-[#879f98]/40">•</span>
          <span>{reservation?.offer?.price} €</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {canCancel && (
            <button
              onClick={() => window.confirm("Annuler cette réservation ?") && onCancel(reservation.id, reservation.status)}
              className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-light text-[#879f98] hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Annuler
            </button>
          )}
          {canRate && (
            <button
              onClick={() => onOpenRating?.(reservation)}
              className="rounded-full border border-[#132A24]/20 px-4 py-1.5 text-xs font-light text-[#132A24] hover:bg-[#eef5f1] transition-colors"
            >
              Laisser un avis
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

const RatingModal = ({ reservation, onClose, onSubmit, submitting }) => {
  const [note, setNote] = useState("5");
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => { setNote("5"); setComment(""); setLocalError(""); }, [reservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note) { setLocalError("Sélectionnez une note."); return; }
    setLocalError("");
    try { await onSubmit({ note, comment }); } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">

        <div className="px-6 pt-6 pb-4 border-b border-black/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Avis</p>
            <h4 className="text-lg font-light text-[#132A24] tracking-tight">Partager votre avis</h4>
            <p className="mt-0.5 text-sm text-[#879f98] font-light">
              {reservation?.offer?.enterprise?.name
                ? `${reservation.offer.enterprise.name} · ${reservation?.offer?.name ?? ""}`
                : reservation?.offer?.name ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black/5 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] transition-colors text-lg flex-shrink-0"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2" htmlFor="note">
              Note
            </label>
            <select
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2.5 text-sm text-[#132A24] font-light focus:outline-none focus:ring-2 focus:ring-[#132A24]/15 focus:border-[#132A24]/30 transition-colors"
            >
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Très bon</option>
              <option value="3">3 — Correct</option>
              <option value="2">2 — Moyen</option>
              <option value="1">1 — Décevant</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2" htmlFor="comment">
              Commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={submitting}
              placeholder="Décrivez votre expérience…"
              className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2.5 text-sm text-[#132A24] placeholder:text-[#879f98] font-light focus:outline-none focus:ring-2 focus:ring-[#132A24]/15 focus:border-[#132A24]/30 transition-colors resize-none"
            />
          </div>

          {localError && <p className="text-sm text-red-500 font-light">{localError}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-black/5 text-sm font-light text-[#879f98] hover:bg-[#f5f7f6] hover:text-[#132A24] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#132A24] text-white text-sm font-light hover:bg-[#1b3b33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Envoi…" : "Publier mon avis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAgenda;

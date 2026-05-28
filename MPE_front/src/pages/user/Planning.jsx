import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getData, deleteData, postData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import CustomCalendar from "../../components/DashboardEnterprise/Calendar";
import CreateAvailability from "../../components/Enterprise/DisponibilityCreation";
import { daysOfWeek } from "../../components/Utils/Format/Time";
import DisponibilityForm from "../../components/Enterprise/Form/DisponibilityForm";

const AvailabilityList = ({ slots, onDelete, onEdit }) => {
  if (!slots.length) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] p-6 text-center text-sm text-[#879f98] font-light">
        Aucun créneau enregistré pour le moment.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {slots.map((slot) => (
        <li
          key={slot.id}
          className="flex items-center justify-between rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-3 text-sm hover:bg-[#eef5f1] transition-colors"
        >
          <div>
            <p className="font-light text-[#132A24]">{slot.day}</p>
            <p className="text-[#879f98] font-light text-xs">
              {slot.start_hour} → {slot.end_hour}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {typeof onEdit === "function" && (
              <button
                onClick={() => onEdit(slot)}
                className="rounded-lg border border-black/10 px-3 py-1 text-xs font-light text-[#132A24] transition hover:bg-[#132A24] hover:text-white"
              >
                Modifier
              </button>
            )}
            <button
              onClick={() => onDelete(slot.id)}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs font-light text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

AvailabilityList.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      day: PropTypes.string.isRequired,
      start_hour: PropTypes.string.isRequired,
      end_hour: PropTypes.string.isRequired,
    }),
  ),
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
};

const ManualBlockList = ({ blocks, onDelete }) => {
  if (!blocks.length) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] p-6 text-center text-sm text-[#879f98] font-light">
        Aucun verrou ou fermeture programmée.
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="flex items-center justify-between rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-3 text-sm hover:bg-[#eef5f1] transition-colors"
        >
          <div>
            <p className="font-light text-[#132A24]">
              {new Date(block.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </p>
            <p className="text-[#879f98] font-light text-xs">
              {block.start_time} → {block.end_time}
            </p>
            {block.reason && (
              <p className="text-xs text-[#879f98] font-light italic">{block.reason}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(block.id)}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-light text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
};

ManualBlockList.propTypes = {
  blocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      date: PropTypes.string.isRequired,
      start_time: PropTypes.string.isRequired,
      end_time: PropTypes.string.isRequired,
      reason: PropTypes.string,
    }),
  ),
  onDelete: PropTypes.func.isRequired,
};

const inputCls =
  "w-full rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] border border-black/5 px-3 py-2 text-sm font-light outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const labelCls = "text-[10px] uppercase tracking-widest text-[#879f98] font-light";

const ManualBlockForm = ({ onSubmit }) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Renseignez la date et les horaires.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        date,
        start_time: startTime,
        end_time: endTime,
        reason: reason.trim() || null,
      });
      setDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={`mt-1 ${inputCls}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Heure de début</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </div>
        <div>
          <label className={labelCls}>Heure de fin</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Motif (optionnel)</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`mt-1 ${inputCls}`}
          placeholder="Congés, déplacement, etc."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white transition hover:bg-[#1b3b33] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Enregistrement…" : "Verrouiller le créneau"}
      </button>
    </form>
  );
};

ManualBlockForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const SectionCard = ({ title, label, children }) => (
  <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
    {label && <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">{label}</p>}
    {title && <h3 className="text-base font-light text-[#132A24] tracking-tight mb-4">{title}</h3>}
    {children}
  </div>
);

SectionCard.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
};

const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const DAY_NAMES = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const STATUS_CONFIG = {
  pending:   { label: "En attente", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  accepted:  { label: "Acceptée",   cls: "bg-[#eef5f1] text-[#132A24] border border-[#132A24]/15" },
  rejected:  { label: "Refusée",    cls: "bg-black/5 text-[#879f98] border border-black/5" },
  cancelled: { label: "Annulée",    cls: "bg-red-50 text-red-500 border border-red-200" },
  done:      { label: "Terminée",   cls: "bg-blue-50 text-blue-600 border border-blue-200" },
};

export default function Planning() {
  const { slug } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [disponibilities, setDisponibilities] = useState([]);
  const [manualBlocks, setManualBlocks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Tous");
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterDayOfWeek, setFilterDayOfWeek] = useState(-1);

  const fetchEnterprise = useCallback(async () => {
    try {
      const data = await getData(`enterprise/${slug}`);
      setEnterprise(data);
    } catch (error) {
      console.error("Error fetching enterprise data:", error);
      setErrorMessage("Impossible de charger l'entreprise.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchDisponibilities = useCallback(async () => {
    try {
      const data = await getData(`enterprises/${slug}/disponibilites`);
      if (Array.isArray(data)) {
        setDisponibilities(data);
        setManualBlocks([]);
      } else {
        setDisponibilities(data?.disponibilities || []);
        setManualBlocks(data?.manualBlocks || []);
      }
    } catch (error) {
      console.error("Error fetching disponibilities:", error);
    }
  }, [slug]);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await getData(`enterprises/${slug}/reservations`);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  }, [slug]);

  useEffect(() => { fetchEnterprise(); }, [fetchEnterprise]);

  useEffect(() => {
    if (enterprise?.isPremium) {
      fetchDisponibilities();
      fetchReservations();
    }
  }, [enterprise, fetchDisponibilities, fetchReservations]);

  const handleDeleteDisponibility = useCallback(async (disponibilityId) => {
    try {
      await deleteData(`enterprises/${slug}/disponibilites/${disponibilityId}`);
      toast.success("Créneau supprimé.");
      fetchDisponibilities();
    } catch (error) {
      console.error("Error deleting disponibility:", error);
      toast.error("Impossible de supprimer ce créneau.");
    }
  }, [fetchDisponibilities, slug]);

  const handleCreateManualBlock = useCallback(async (payload) => {
    try {
      await postData(`enterprises/${slug}/manual-blocks`, payload);
      toast.success("Créneau verrouillé.");
      fetchDisponibilities();
    } catch (error) {
      console.error("Error creating manual block:", error);
      try {
        const data = JSON.parse(error.message);
        toast.error(data.error || data.errors || "Impossible de verrouiller ce créneau.");
      } catch {
        toast.error("Impossible de verrouiller ce créneau.");
      }
    }
  }, [fetchDisponibilities, slug]);

  const handleDeleteManualBlock = useCallback(async (blockId) => {
    try {
      await deleteData(`enterprises/${slug}/manual-blocks/${blockId}`);
      toast.success("Fermeture supprimée.");
      fetchDisponibilities();
    } catch (error) {
      console.error("Error deleting manual block:", error);
      toast.error("Impossible de supprimer cette fermeture.");
    }
  }, [fetchDisponibilities, slug]);

  const handleEditDisponibility = useCallback((slot) => { setEditingSlot(slot); }, []);

  const handleUpdateDisponibility = useCallback(async (payload) => {
    const slotId = payload.id || editingSlot?.id;
    if (!slotId) return;
    const dayValue = Array.isArray(payload.day) ? payload.day[0] : payload.day;
    try {
      await putData(`enterprise/${slug}/disponibility/${slotId}`, {
        day: dayValue,
        start_hour: payload.start_hour,
        end_hour: payload.end_hour,
      });
      toast.success("Créneau mis à jour.");
      setEditingSlot(null);
      fetchDisponibilities();
    } catch (error) {
      console.error("Error updating disponibility:", error);
      try {
        const data = JSON.parse(error.message);
        toast.error(data.error || data.errors || "Impossible de modifier le créneau.");
      } catch {
        toast.error("Impossible de modifier le créneau.");
      }
    }
  }, [editingSlot, fetchDisponibilities, slug]);

  const cancelEdit = useCallback(() => { setEditingSlot(null); }, []);

  const handleSelectEvent = useCallback((event) => {
    if (event.type === "reservation" && event.rawData) {
      setSelectedReservation(event.rawData);
    }
  }, []);

  const calendarReservations = useMemo(() => {
    if (!enterprise?.isPremium) return [];
    const merged = new Map();
    [...(reservations || []),
      ...(enterprise?.offers?.flatMap((offer) => offer.reservations) || []),
    ].forEach((item) => {
      if (item && !merged.has(item.id)) merged.set(item.id, item);
    });
    return Array.from(merged.values());
  }, [enterprise, reservations]);

  const filteredDisponibilities = useMemo(() => {
    if (selectedDay === "Tous") return disponibilities;
    return disponibilities.filter((slot) => slot.day === selectedDay);
  }, [disponibilities, selectedDay]);

  // Années disponibles pour le filtre
  const availableYears = useMemo(() => {
    const years = new Set(
      calendarReservations
        .filter((r) => r.date)
        .map((r) => new Date(r.date).getFullYear())
    );
    years.add(now.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [calendarReservations]);

  const filteredReservations = useMemo(() => {
    return calendarReservations
      .filter((r) => {
        if (!r.date) return false;
        const d = new Date(r.date);
        if (d.getMonth() !== filterMonth) return false;
        if (d.getFullYear() !== filterYear) return false;
        if (filterDayOfWeek !== -1 && d.getDay() !== filterDayOfWeek) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [calendarReservations, filterMonth, filterYear, filterDayOfWeek]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <p className="text-sm text-[#879f98] font-light">Chargement du calendrier…</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-500 font-light">
        {errorMessage}
      </div>
    );
  }

  if (!enterprise?.isPremium) {
    return (
      <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-8 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-[#eef5f1] flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-[#4b8a74]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
        </div>
        <h2 className="text-base font-light text-[#132A24] tracking-tight mb-1">
          Calendrier réservé aux entreprises Premium
        </h2>
        <p className="text-sm text-[#879f98] font-light">
          Passez au plan Premium pour activer la gestion des créneaux et des réservations.
        </p>
      </div>
    );
  }

  const r = selectedReservation;
  const statusLabel = {
    pending:   { text: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    accepted:  { text: "Acceptée",   cls: "bg-[#eef5f1] text-[#132A24] border-[#132A24]/15" },
    rejected:  { text: "Refusée",    cls: "bg-black/5 text-[#879f98] border-black/5" },
    cancelled: { text: "Annulée",    cls: "bg-red-50 text-red-500 border-red-200" },
    done:      { text: "Terminée",   cls: "bg-blue-50 text-blue-600 border-blue-200" },
  };

  return (
    <div className="mt-6 space-y-6 pb-8">

      {/* Calendrier */}
      <SectionCard label="Entreprise" title="Planning">
        <p className="text-sm text-[#879f98] font-light -mt-2 mb-4">
          Cliquez sur un rendez-vous pour afficher son détail.
        </p>
        <CustomCalendar
          reservations={calendarReservations}
          indisponibilities={enterprise?.indisponibilities || []}
          disponibilities={disponibilities}
          manualBlocks={manualBlocks}
          onSelectEvent={handleSelectEvent}
        />
      </SectionCard>

      {/* ── Mes réservations ── */}
      <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Agenda</p>
            <h3 className="text-base font-light text-[#132A24] tracking-tight">Mes réservations</h3>
            <p className="text-xs text-[#879f98] font-light mt-0.5">Retrouvez l'ensemble de vos rendez-vous à venir et passés.</p>
          </div>
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mois */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="h-9 rounded-xl bg-[#f5f7f6] text-[#132A24] text-sm font-light border border-black/5 px-3 outline-none focus:border-[#132A24]/30 transition"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            {/* Année */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="h-9 rounded-xl bg-[#f5f7f6] text-[#132A24] text-sm font-light border border-black/5 px-3 outline-none focus:border-[#132A24]/30 transition"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {/* Jour de la semaine */}
            <select
              value={filterDayOfWeek}
              onChange={(e) => setFilterDayOfWeek(Number(e.target.value))}
              className="h-9 rounded-xl bg-[#f5f7f6] text-[#132A24] text-sm font-light border border-black/5 px-3 outline-none focus:border-[#132A24]/30 transition"
            >
              <option value={-1}>Tous les jours</option>
              {DAY_NAMES.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] p-8 text-center">
            <p className="text-sm text-[#879f98] font-light">Aucune réservation pour cette période.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReservations.map((r) => {
              const d = new Date(r.date);
              const sc = STATUS_CONFIG[r.status] ?? { label: r.status, cls: "bg-black/5 text-[#879f98] border border-black/5" };
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReservation(r)}
                  className="w-full text-left rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-3 hover:bg-[#eef5f1] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-black/5 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-light text-[#879f98] uppercase leading-none">
                        {d.toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                      <span className="text-base font-light text-[#132A24] leading-none">{d.getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-light text-[#132A24]">
                        {r.offer?.name ?? "Service sans nom"}
                      </p>
                      <p className="text-xs text-[#879f98] font-light">
                        {DAY_NAMES[d.getDay()]} — {r.start_time ?? ""}{r.end_time ? ` → ${r.end_time}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.user && (
                      <span className="text-xs text-[#879f98] font-light">
                        {r.user.firstname || r.user.firstName || r.user.username || ""}
                      </span>
                    )}
                    <span className={`text-[11px] font-light px-2.5 py-0.5 rounded-full ${sc.cls}`}>
                      {sc.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Créneaux & ajout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CreateAvailability onCreated={fetchDisponibilities} />

        <SectionCard label="Planning" title="Créneaux enregistrés">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Jour affiché</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="rounded-lg border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:border-[#132A24]/30 focus:outline-none"
            >
              <option value="Tous">Tous</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <AvailabilityList
            slots={filteredDisponibilities}
            onDelete={handleDeleteDisponibility}
            onEdit={handleEditDisponibility}
          />
          {editingSlot && (
            <div className="mt-4 rounded-xl border border-black/5 bg-[#f5f7f6] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-light text-[#132A24]">Modifier — {editingSlot.day}</p>
                <button
                  onClick={cancelEdit}
                  className="rounded-lg border border-black/10 px-3 py-1 text-xs font-light text-[#879f98] hover:bg-[#eef5f1] transition"
                >
                  Annuler
                </button>
              </div>
              <DisponibilityForm
                initialData={editingSlot}
                onSubmit={handleUpdateDisponibility}
                submitLabel="Mettre à jour"
              />
            </div>
          )}
        </SectionCard>
      </div>

      {/* Fermetures */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard label="Planning" title="Fermer un créneau">
          <ManualBlockForm onSubmit={handleCreateManualBlock} />
        </SectionCard>
        <SectionCard label="Planning" title="Fermetures planifiées">
          <ManualBlockList blocks={manualBlocks} onDelete={handleDeleteManualBlock} />
        </SectionCard>
      </div>

      {/* Modal rendez-vous */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-black/5 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 className="text-base font-light text-[#132A24]">Détail du rendez-vous</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f7f6] text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] transition text-lg"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {r.status && (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-light border ${statusLabel[r.status]?.cls ?? "bg-black/5 text-[#879f98] border-black/5"}`}>
                  {statusLabel[r.status]?.text ?? r.status}
                </span>
              )}
              <Row label="Service" value={r.offer?.name ?? "—"} />
              <Row
                label="Date"
                value={r.date ? new Date(r.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}
              />
              <Row
                label="Horaire"
                value={r.start_time && r.end_time ? `${r.start_time} → ${r.end_time}` : "—"}
              />
              <Row label="Client" value={r.user?.firstname || r.user?.firstName || r.user?.username || "—"} />
              {r.contact_phone && <Row label="Téléphone" value={r.contact_phone} />}
              {r.offer?.price && <Row label="Prix" value={`${r.offer.price} €`} />}
              {r.offer?.duration && (
                <Row
                  label="Durée"
                  value={r.offer.duration >= 60
                    ? `${Math.floor(r.offer.duration / 60)}h${r.offer.duration % 60 > 0 ? r.offer.duration % 60 : ""}`
                    : `${r.offer.duration} min`}
                />
              )}
            </div>

            <div className="border-t border-black/5 px-6 py-4">
              <button
                onClick={() => setSelectedReservation(null)}
                className="w-full rounded-xl bg-[#f5f7f6] px-4 py-2.5 text-sm font-light text-[#132A24] hover:bg-[#eef5f1] transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-[#879f98] font-light flex-shrink-0">{label}</span>
    <span className="text-[#132A24] font-light text-right">{value}</span>
  </div>
);

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

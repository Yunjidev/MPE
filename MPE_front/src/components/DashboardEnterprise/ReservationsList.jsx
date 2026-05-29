import { useState, useEffect, useMemo } from "react";
import { getData, putData, postData } from "../../services/data-fetch";
import { FaCheck, FaTimes } from "react-icons/fa";
import {
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEllipseOutline,
  IoCallOutline,
  IoMailOutline,
  IoAddOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const inputCls =
  "w-full rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] border border-black/5 px-3 py-2 text-sm font-light outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const labelCls = "block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1";

function ManualReservationModal({ slug, offers, onClose, onCreated }) {
  const [offerId, setOfferId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerId || !date || !startTime || !clientName.trim()) {
      toast.error("Prestation, date, heure et nom du client sont obligatoires.");
      return;
    }
    try {
      setSubmitting(true);
      await postData(`enterprises/${slug}/reservations/manual`, {
        offerId: Number(offerId),
        date,
        start_time: startTime,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        client_phone: clientPhone.trim() || undefined,
      });
      toast.success("Réservation manuelle créée.");
      onCreated();
      onClose();
    } catch (err) {
      try {
        const data = JSON.parse(err.message);
        toast.error(data.error || "Erreur lors de la création.");
      } catch {
        toast.error("Erreur lors de la création.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-black/5 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Calendrier</p>
            <h2 className="text-base font-light text-[#132A24]">Nouvelle réservation manuelle</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f7f6] text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] transition"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Prestation *</label>
            <select
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Sélectionner une prestation</option>
              {offers.map((o) => {
                const dur = o.duration
                  ? o.duration >= 60
                    ? `${Math.floor(o.duration / 60)}h${o.duration % 60 > 0 ? o.duration % 60 : ""}`
                    : `${o.duration} min`
                  : "";
                return (
                  <option key={o.id} value={o.id}>
                    {o.name}{dur ? ` — ${dur}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Heure de début *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">Informations client</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Nom du client *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Prénom Nom"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Email (optionnel)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Téléphone (optionnel)</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="0612345678"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-[#879f98] font-light">
            La réservation sera automatiquement marquée comme <strong className="text-[#132A24] font-light">Validée</strong> et apparaîtra dans le calendrier.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-light text-[#879f98] hover:bg-[#f5f7f6] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white transition hover:bg-[#1b3b33] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "Enregistrement…" : "Créer la réservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ReservationsList = () => {
  const { slug } = useParams();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pageSize, setPageSize] = useState(8);
  const [pageIndex, setPageIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showManualModal, setShowManualModal] = useState(false);

  const fetchOffers = async () => {
    try {
      const data = await getData(`enterprise/${slug}/offers`);
      setOffers(Array.isArray(data) ? data : []);
    } catch {
      setOffers([]);
    }
  };

  const fetchReservations = async () => {
    try {
      const data = await getData(`enterprise/${slug}/reservations`);
      const sorted =
        data
          ?.slice()
          ?.sort(
            (a, b) =>
              new Date(`${b.date}T${b.start_time}`) -
              new Date(`${a.date}T${a.start_time}`),
          ) || [];
      setReservations(sorted);
      setFilteredReservations(sorted);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      alert("Une erreur est survenue lors de la récupération des réservations.");
    }
  };

  useEffect(() => {
    if (slug) {
      fetchReservations();
      fetchOffers();
    }
  }, [slug]);

  const availableYears = useMemo(() => {
    const years = new Set();
    reservations.forEach((reservation) => {
      if (reservation.date) {
        const parsed = new Date(reservation.date);
        if (!Number.isNaN(parsed.getTime())) {
          years.add(parsed.getFullYear());
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [reservations]);

  const availableMonths = useMemo(() => {
    const MONTH_NAMES = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];

    const months = new Set();
    reservations.forEach((reservation) => {
      if (reservation.date) {
        const parsed = new Date(reservation.date);
        if (!Number.isNaN(parsed.getTime())) {
          months.add(parsed.getMonth());
        }
      }
    });

    return Array.from(months)
      .sort((a, b) => a - b)
      .map((monthIndex) => ({
        value: String(monthIndex),
        label: MONTH_NAMES[monthIndex],
      }));
  }, [reservations]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const now = Date.now();

    const filtered = reservations
      .filter((reservation) => {
        if (!reservation.date) return true;
        const startDate = new Date(reservation.date);
        if (!Number.isNaN(startDate.getTime()) && reservation.start_time) {
          const [hours, minutes] = reservation.start_time.split(":");
          startDate.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
        }
        const startTimestamp = startDate.getTime();
        if (Number.isNaN(startTimestamp)) return true;
        if (timeFilter === "upcoming") return startTimestamp >= now;
        if (timeFilter === "past") return startTimestamp < now;
        return true;
      })
      .filter((reservation) => {
        const offerName = reservation.offer?.name?.toLowerCase() || "";
        const userName =
          reservation.user?.firstname?.toLowerCase() ||
          reservation.user?.firstName?.toLowerCase() ||
          reservation.user?.username?.toLowerCase() ||
          reservation.manual_client_name?.toLowerCase() ||
          "";
        return offerName.includes(lowercasedQuery) || userName.includes(lowercasedQuery);
      })
      .filter(
        (reservation) =>
          selectedStatus === "all" || reservation.status === selectedStatus,
      );

    const filteredByDate = filtered.filter((reservation) => {
      if (!reservation.date) {
        return selectedMonth === "all" && selectedYear === "all";
      }
      const parsed = new Date(reservation.date);
      if (Number.isNaN(parsed.getTime())) {
        return selectedMonth === "all" && selectedYear === "all";
      }
      const matchesYear =
        selectedYear === "all" || parsed.getFullYear() === Number(selectedYear);
      const matchesMonth =
        selectedMonth === "all" || parsed.getMonth() === Number(selectedMonth);
      return matchesYear && matchesMonth;
    });

    setFilteredReservations(filteredByDate);
    setPageIndex(0);
  }, [searchQuery, reservations, selectedStatus, timeFilter, selectedMonth, selectedYear]);

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await putData(`reservation/${reservationId}`, { status: status.toLowerCase() });
      fetchReservations();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la réservation:", error);
      alert(`Une erreur est survenue lors de la mise à jour du statut: ${error.message || "Erreur inconnue"}`);
    }
  };

  const stats = useMemo(() => {
    const base = { total: reservations.length, pending: 0, accepted: 0, rejected: 0, cancelled: 0, done: 0 };
    reservations.forEach((reservation) => {
      if (base[reservation.status] !== undefined) base[reservation.status] += 1;
    });
    return base;
  }, [reservations]);

  const paginatedReservations = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredReservations.slice(start, start + pageSize);
  }, [filteredReservations, pageIndex, pageSize]);

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0);
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "pending":
        return { icon: <IoEllipseOutline className="text-amber-400" />, text: "En attente", badge: "bg-amber-50 text-amber-700 border border-amber-200" };
      case "accepted":
        return { icon: <IoCheckmarkCircleOutline className="text-[#4b8a74]" />, text: "Validée", badge: "bg-[#eef5f1] text-[#132A24] border-[#132A24]/15" };
      case "rejected":
        return { icon: <IoCloseCircleOutline className="text-red-400" />, text: "Refusée", badge: "bg-black/5 text-[#879f98] border-black/5" };
      case "cancelled":
        return { icon: <IoCloseCircleOutline className="text-red-400" />, text: "Annulée", badge: "bg-red-50 text-red-500 border-red-200" };
      case "done":
        return { icon: <IoCheckmarkCircleOutline className="text-blue-500" />, text: "Terminée", badge: "bg-blue-50 text-blue-600 border-blue-200" };
      default:
        return { icon: <IoEllipseOutline className="text-[#879f98]" />, text: status, badge: "bg-black/5 text-[#879f98] border-black/5" };
    }
  };

  const getClientName = (reservation) =>
    [reservation.user?.firstname, reservation.user?.lastname].filter(Boolean).join(" ") ||
    reservation.user?.username ||
    reservation.manual_client_name ||
    "Client";

  const hasMore = filteredReservations.length > paginatedReservations.length;

  return (
    <div className="space-y-5 mt-6">
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
              Entreprise
            </p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight">
              Planning client
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#879f98] font-light">
              Filtrez, triez et agissez sur vos rendez-vous.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                { label: "Totales", value: stats.total },
                { label: "En attente", value: stats.pending },
                { label: "Validées", value: stats.accepted },
                { label: "Terminées", value: stats.done },
                { label: "Annulées", value: stats.cancelled },
                { label: "Refusées", value: stats.rejected },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2.5 text-sm"
                >
                  <p className="text-[#879f98] text-xs font-light">{item.label}</p>
                  <p className="mt-0.5 text-lg font-light text-[#132A24]">{item.value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white transition hover:bg-[#1b3b33] active:scale-[0.98] shrink-0"
            >
              <IoAddOutline className="text-base" />
              Réservation manuelle
            </button>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              type="text"
              placeholder="Rechercher une prestation ou un client…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2.5 text-sm text-[#132A24] placeholder:text-[#879f98] font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition lg:w-72"
            />
            <div className="flex flex-wrap gap-1.5">
              {["upcoming", "all"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`rounded-full px-3 py-1 text-xs font-light transition border ${
                    timeFilter === filter
                      ? "bg-[#132A24] text-white border-[#132A24]"
                      : "border-black/10 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24]"
                  }`}
                >
                  {filter === "upcoming" ? "À venir" : "Toutes"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "all", label: "Tous" },
              { value: "pending", label: "En attente" },
              { value: "accepted", label: "Validée" },
              { value: "done", label: "Terminée" },
              { value: "cancelled", label: "Annulée" },
              { value: "rejected", label: "Refusée" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedStatus(item.value)}
                className={`rounded-full px-3 py-1 text-xs font-light transition border ${
                  selectedStatus === item.value
                    ? "bg-[#132A24] text-white border-[#132A24]"
                    : "border-black/10 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="year-filter" className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
              Année
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="rounded-lg border border-black/5 bg-[#f5f7f6] px-3 py-1.5 text-xs text-[#132A24] font-light focus:outline-none"
            >
              <option value="all">Toutes</option>
              {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="month-filter" className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
              Mois
            </label>
            <select
              id="month-filter"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-lg border border-black/5 bg-[#f5f7f6] px-3 py-1.5 text-xs text-[#132A24] font-light focus:outline-none"
            >
              <option value="all">Tous</option>
              {availableMonths.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {paginatedReservations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-12 text-center text-sm text-[#879f98] font-light">
              Aucune réservation trouvée avec ces filtres.
            </div>
          ) : (
            paginatedReservations.map((reservation) => {
              const { icon, text, badge } = getStatusDetails(reservation.status);
              const baseDate = reservation.date ? new Date(reservation.date) : null;
              if (baseDate && !Number.isNaN(baseDate.getTime()) && reservation.start_time) {
                const [hours, minutes] = reservation.start_time.split(":");
                baseDate.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
              }
              const formattedDate =
                baseDate && !Number.isNaN(baseDate.getTime())
                  ? baseDate.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
                  : "Date inconnue";
              const isManual = !reservation.User_id && reservation.manual_client_name;

              return (
                <div
                  key={reservation.id}
                  className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
                        {formattedDate}
                      </p>
                      <h3 className="mt-0.5 text-sm font-light text-[#132A24]">
                        {reservation.offer?.name || "Offre supprimée"}
                      </h3>
                      {reservation.offer?.duration && (
                        <p className="mt-0.5 text-xs text-[#879f98] font-light">
                          {reservation.offer.duration} min
                          {reservation.offer.price
                            ? ` · ${Number(reservation.offer.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
                            : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isManual && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-light bg-[#eef5f1] text-[#4b8a74] border border-[#132A24]/10">
                          Manuel
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-light border ${badge}`}>
                        {icon}
                        {text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-[#879f98] font-light md:grid-cols-2">
                    <span className="inline-flex items-center gap-1.5">
                      <IoPersonOutline className="text-sm text-[#879f98]" />
                      {getClientName(reservation)}
                    </span>
                    {(reservation.user?.email || reservation.manual_client_email) && (
                      <span className="inline-flex items-center gap-1.5">
                        <IoMailOutline className="text-sm text-[#879f98]" />
                        {reservation.user?.email || reservation.manual_client_email}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <IoCalendarOutline className="text-sm text-[#879f98]" />
                      {formattedDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IoTimeOutline className="text-sm text-[#879f98]" />
                      {reservation.start_time} – {reservation.end_time}
                    </span>
                    {reservation.contact_phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <IoCallOutline className="text-sm text-[#879f98]" />
                        {reservation.contact_phone}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {reservation.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, "accepted")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#132A24]/15 bg-[#eef5f1] px-3 py-1.5 text-xs font-light text-[#132A24] transition hover:bg-[#132A24] hover:text-white"
                        >
                          <FaCheck /> Valider
                        </button>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-light text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          <FaTimes /> Refuser
                        </button>
                      </>
                    )}
                    {reservation.status === "accepted" && (
                      <button
                        onClick={() => updateReservationStatus(reservation.id, "done")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-light text-blue-600 transition hover:bg-blue-500 hover:text-white"
                      >
                        <FaCheck /> Marquer terminé
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-6 text-sm text-[#879f98] font-light md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
              className="rounded-full border border-black/10 px-4 py-2 text-[#4b615a] font-light transition hover:bg-[#eef5f1] hover:border-[#132A24]/20 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              onClick={() =>
                setPageIndex((prev) =>
                  paginatedReservations.length < pageSize ? prev : prev + 1,
                )
              }
              disabled={paginatedReservations.length < pageSize}
              className="rounded-full border border-black/10 px-4 py-2 text-[#4b615a] font-light transition hover:bg-[#eef5f1] hover:border-[#132A24]/20 disabled:opacity-40"
            >
              Suivant
            </button>
            <span className="ml-3 text-xs text-[#879f98] font-light">
              Page {pageIndex + 1} · {filteredReservations.length} résultats
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#879f98] font-light">Afficher</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:border-[#132A24]/30 focus:outline-none"
            >
              {[8, 16, 24].map((size) => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasMore && (
        <div className="text-center text-xs text-[#879f98] font-light">
          {filteredReservations.length} réservations au total · ajustez la taille de page pour en afficher davantage.
        </div>
      )}

      {showManualModal && (
        <ManualReservationModal
          slug={slug}
          offers={offers}
          onClose={() => setShowManualModal(false)}
          onCreated={fetchReservations}
        />
      )}
    </div>
  );
};

export default ReservationsList;

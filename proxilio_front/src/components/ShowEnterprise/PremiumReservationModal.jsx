"use strict";

import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import frLocale from "date-fns/locale/fr";
import { registerLocale } from "react-datepicker";
import { getData, postData } from "../../services/data-fetch";
import { toast } from "react-toastify";

registerLocale("fr", frLocale);

const FRENCH_DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const getDayLabel = (date) => {
  if (!date) return "";
  return FRENCH_DAYS[date.getDay()];
};

const formatReservationDate = (date, time) =>
  dayjs(date).hour(Number(time.split(":")[0])).minute(Number(time.split(":")[1]));

const buildSlots = (disponibilities, reservations, manualBlocks, selectedDate, durationMinutes, multiBooking = false) => {
  if (!selectedDate || !durationMinutes) return [];

  const dayLabel = getDayLabel(selectedDate);
  const dayDisponibilities = disponibilities.filter((d) => d.day === dayLabel);
  if (dayDisponibilities.length === 0) return [];

  const selectedDateStr = dayjs(selectedDate).format("YYYY-MM-DD");
  const sameDayReservations = multiBooking ? [] : reservations.filter((r) =>
    typeof r.date === "string" ? r.date.startsWith(selectedDateStr) : dayjs(r.date).format("YYYY-MM-DD") === selectedDateStr
  );
  const sameDayManualBlocks = manualBlocks
    .filter((b) => dayjs(b.date).isSame(selectedDate, "day"))
    .map((b) => ({
      start: dayjs(selectedDate).hour(parseInt(b.start_time.split(":")[0])).minute(parseInt(b.start_time.split(":")[1])),
      end:   dayjs(selectedDate).hour(parseInt(b.end_time.split(":")[0])).minute(parseInt(b.end_time.split(":")[1])),
    }));

  const now = dayjs();
  const slots = [];
  const stepMinutes = durationMinutes >= 60 ? 30 : 15;

  dayDisponibilities.forEach((dispo) => {
    const windowStart = dayjs(dispo.start_hour, "HH:mm");
    const windowEnd   = dayjs(dispo.end_hour,   "HH:mm");
    let cursor = windowStart.clone();

    while (cursor.isBefore(windowEnd)) {
      const slotEnd = cursor.clone().add(durationMinutes, "minute");
      if (slotEnd.isAfter(windowEnd)) break;

      const slotStartDT = dayjs(selectedDate).hour(cursor.hour()).minute(cursor.minute());
      const slotEndDT   = dayjs(selectedDate).hour(slotEnd.hour()).minute(slotEnd.minute());

      if (slotStartDT.isBefore(now)) { cursor = slotEnd; continue; }

      const slotStartStr = cursor.format("HH:mm");
      const slotEndStr   = slotEnd.format("HH:mm");
      const overlaps = sameDayReservations.some((r) => {
        if (r.status === "cancelled" || r.status === "rejected") return false;
        const rStart = r.start_time.substring(0, 5);
        const rEnd   = r.end_time.substring(0, 5);
        return slotStartStr < rEnd && slotEndStr > rStart;
      });

      if (!overlaps) {
        const blocked = sameDayManualBlocks.some(
          (b) => slotStartDT.isBefore(b.end) && slotEndDT.isAfter(b.start)
        );
        if (!blocked) {
          const hour = slotStartDT.hour();
          const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
          slots.push({ value: cursor.format("HH:mm"), label: `${cursor.format("HH:mm")} → ${slotEnd.format("HH:mm")}`, period, startDate: slotStartDT });
        }
      }
      cursor = cursor.add(stepMinutes, "minute");
    }
  });

  return slots;
};

const PremiumReservationModal = ({ enterpriseId, isOpen, onClose, onBooked, offers, initialOfferId, multiBooking = false }) => {
  const [disponibilities, setDisponibilities] = useState([]);
  const [reservations, setReservations]       = useState([]);
  const [manualBlocks, setManualBlocks]       = useState([]);
  const [selectedDate, setSelectedDate]       = useState(null);
  const [selectedSlot, setSelectedSlot]       = useState(null);
  const [selectedOffer, setSelectedOffer]     = useState(null);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [phone, setPhone]                     = useState("");
  const [activePeriod, setActivePeriod]       = useState("all");

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    try {
      const [disposRaw, resa] = await Promise.all([
        getData(`enterprises/${enterpriseId}/disponibilites`),
        getData(`enterprises/${enterpriseId}/reservations/public`),
      ]);
      if (Array.isArray(disposRaw)) {
        setDisponibilities(disposRaw);
        setManualBlocks([]);
      } else {
        setDisponibilities(disposRaw?.disponibilities || disposRaw?.disponibilites || []);
        setManualBlocks(disposRaw?.manualBlocks || []);
      }
      setReservations(resa || []);
    } catch {
      toast.error("Impossible de charger les créneaux disponibles.");
    }
  }, [enterpriseId, isOpen]);

  useEffect(() => {
    if (isOpen) { fetchData(); setSelectedSlot(null); }
  }, [fetchData, isOpen]);

  useEffect(() => {
    if (!isOpen) { setSelectedOffer(null); setPhone(""); return; }
    if (!Array.isArray(offers) || offers.length === 0) { setSelectedOffer(null); return; }
    if (initialOfferId) {
      const matched = offers.find((o) => Number(o.id) === Number(initialOfferId));
      if (matched) { setSelectedOffer(matched); return; }
    }
    setSelectedOffer((cur) => (cur && offers.find((o) => o.id === cur.id)) ? cur : offers[0]);
  }, [offers, isOpen, initialOfferId]);

  useEffect(() => { setSelectedSlot(null); }, [selectedOffer, selectedDate]);
  useEffect(() => { setActivePeriod("all"); }, [selectedDate]);

  const durationMinutes = selectedOffer ? parseInt(selectedOffer.duration, 10) : null;

  const handleClose = () => { setSelectedSlot(null); setPhone(""); onClose(); };

  const availableSlots = useMemo(
    () => buildSlots(disponibilities, reservations, manualBlocks, selectedDate, durationMinutes, multiBooking),
    [disponibilities, reservations, manualBlocks, selectedDate, durationMinutes, multiBooking]
  );

  const availableDayIndices = useMemo(() => {
    const set = new Set();
    disponibilities.forEach((d) => { const i = FRENCH_DAYS.indexOf(d.day); if (i >= 0) set.add(i); });
    return set;
  }, [disponibilities]);

  const displayedSlots = useMemo(
    () => activePeriod === "all" ? availableSlots : availableSlots.filter((s) => s.period === activePeriod),
    [availableSlots, activePeriod]
  );

  const handleSubmit = async () => {
    if (!selectedOffer) { toast.error("Sélectionnez une prestation."); return; }
    if (!selectedDate || !selectedSlot) { toast.error("Sélectionnez une date et un créneau."); return; }
    if (!phone.trim()) { toast.error("Renseignez votre numéro de téléphone."); return; }
    const cleanedPhone = phone.replace(/[\s.-]/g, "");
    if (!/^\+?[0-9]{6,15}$/.test(cleanedPhone)) { toast.error("Numéro de téléphone invalide."); return; }

    try {
      setIsSubmitting(true);
      await postData(`enterprises/${enterpriseId}/reservations`, {
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        start_time: selectedSlot,
        offerId: selectedOffer.id,
        phone: cleanedPhone,
      });
      toast.success("Votre demande de réservation a été envoyée.");
      if (typeof onBooked === "function") onBooked();
      handleClose();
    } catch (error) {
      try {
        const { error: message, errors } = JSON.parse(error.message);
        toast.error(message || errors || "Impossible de réserver ce créneau.");
      } catch {
        toast.error("Connexion requise pour réserver.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const PERIODS = [
    { key: "all", label: "Tous" },
    { key: "morning", label: "Matin" },
    { key: "afternoon", label: "Après-midi" },
    { key: "evening", label: "Soir" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:px-4 sm:py-8">
      <div className="w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl border-0 sm:border border-black/5 shadow-[0_-8px_40px_-4px_rgba(0,0,0,0.12)] sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* Handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-black/10" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-black/5 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#4b615a] font-light mb-1">Réservation</p>
            <h3 className="text-lg sm:text-xl font-light text-[#132A24] tracking-tight">
              Réserver une prestation
            </h3>
            <p className="text-sm text-[#4b615a] font-light mt-0.5 hidden sm:block">
              Sélectionnez une prestation puis choisissez un créneau.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-black/5 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] transition-colors flex-shrink-0 text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Offers */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4b615a] font-light mb-3">Prestations disponibles</p>
            {offers?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {offers.map((offer) => {
                  const isActive = selectedOffer?.id === offer.id;
                  return (
                    <button
                      key={offer.id}
                      onClick={() => setSelectedOffer(offer)}
                      className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-[#132A24] bg-[#eef5f1]"
                          : "border-black/5 bg-[#f5f7f6] hover:border-[#132A24]/20 hover:bg-[#eef5f1]/50"
                      }`}
                    >
                      {offer.image && (
                        <img src={offer.image} alt={offer.name} className="h-20 w-full rounded-lg object-cover" />
                      )}
                      <div className="w-full">
                        <p className="text-sm font-light text-[#132A24] tracking-tight">{offer.name}</p>
                        {offer.description && (
                          <p className="mt-0.5 text-xs text-[#4b615a] font-light line-clamp-2">{offer.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-white border border-black/5 px-2.5 py-0.5 text-xs font-light text-[#132A24]">
                            {offer.duration} min
                          </span>
                          {offer.price && (
                            <span className="rounded-full bg-white border border-black/5 px-2.5 py-0.5 text-xs font-light text-[#132A24]">
                              {Number(offer.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#4b615a] font-light">Aucune prestation disponible pour le moment.</p>
            )}
          </div>

          {/* Calendar + Slots */}
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">

            {/* Calendar */}
            <div className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4">
              <p className="text-xs uppercase tracking-widest text-[#4b615a] font-light mb-3">Date souhaitée</p>
              <DatePicker
                locale="fr"
                selected={selectedDate}
                onChange={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                minDate={new Date()}
                inline
                filterDate={(date) =>
                  availableDayIndices.size === 0 || availableDayIndices.has(dayjs(date).day())
                }
                dayClassName={(date) =>
                  availableDayIndices.has(dayjs(date).day()) ? "!text-[#132A24] !font-light" : "!text-[#879f98]"
                }
                calendarClassName="!bg-transparent !border-0 !font-light"
              />
              <p className="mt-3 text-xs text-[#4b615a] font-light leading-relaxed">
                Seules les dates disponibles apparaissent dans les créneaux.
              </p>
            </div>

            {/* Slots + phone */}
            <div className="space-y-4">
              <div className="rounded-xl border border-black/5 bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-[#4b615a] font-light mb-3">Créneaux disponibles</p>

                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <>
                      {/* Period filters */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {PERIODS.map((p) => (
                          <button
                            key={p.key}
                            onClick={() => setActivePeriod(p.key)}
                            className={`rounded-full px-3 py-1 text-xs font-light border transition-colors ${
                              activePeriod === p.key
                                ? "bg-[#132A24] text-white border-[#132A24]"
                                : "border-black/5 text-[#879f98] hover:border-[#132A24]/20 hover:text-[#132A24]"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      <div className="max-h-52 overflow-y-auto pr-1">
                        {displayedSlots.length > 0 ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {displayedSlots.map((slot) => (
                              <button
                                key={slot.value}
                                onClick={() => setSelectedSlot(slot.value)}
                                className={`rounded-xl border px-4 py-2.5 text-left text-sm font-light tracking-tight transition-all ${
                                  selectedSlot === slot.value
                                    ? "border-[#132A24] bg-[#eef5f1] text-[#132A24]"
                                    : "border-black/5 bg-[#f5f7f6] text-[#132A24] hover:border-[#132A24]/20 hover:bg-[#eef5f1]/60"
                                }`}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-[#132A24]/10 bg-[#f5f7f6] p-4 text-sm text-[#4b615a] font-light text-center">
                            Aucun créneau dans cette plage. Essayez une autre.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#132A24]/10 bg-[#f5f7f6] p-4 text-sm text-[#4b615a] font-light text-center">
                      Aucun créneau disponible ce jour. Essayez une autre date.
                    </div>
                  )
                ) : (
                  <p className="text-sm text-[#4b615a] font-light">
                    Sélectionnez d&apos;abord une date sur le calendrier.
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4">
                <label className="block text-[10px] uppercase tracking-widest text-[#4b615a] font-light mb-2">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 0612345678"
                  className="w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-[#132A24] placeholder:text-[#4b615a] font-light focus:outline-none focus:ring-2 focus:ring-[#132A24]/15 focus:border-[#132A24]/30 transition-colors"
                />
                <p className="mt-1.5 text-[11px] text-[#4b615a] font-light">
                  Ce numéro sera partagé avec l&apos;entreprise pour confirmer la réservation.
                </p>
              </div>

              {selectedOffer && (
                <p className="text-xs text-[#4b615a] font-light px-1">
                  Durée de la prestation : {selectedOffer.duration} minutes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-black/5 flex items-center gap-3 flex-shrink-0 bg-white safe-area-pb">
          <button
            onClick={handleClose}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-black/5 text-sm font-light text-[#879f98] hover:bg-[#f5f7f6] hover:text-[#132A24] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedSlot || !selectedOffer || isSubmitting}
            className="flex-1 sm:flex-none sm:px-5 py-2.5 rounded-xl bg-[#132A24] text-white text-sm font-light hover:bg-[#1b3b33] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Envoi…" : "Confirmer la réservation"}
          </button>
        </div>
      </div>
    </div>
  );
};

PremiumReservationModal.propTypes = {
  enterpriseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBooked: PropTypes.func,
  offers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      image: PropTypes.string,
    })
  ),
  initialOfferId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiBooking: PropTypes.bool,
};

export default PremiumReservationModal;

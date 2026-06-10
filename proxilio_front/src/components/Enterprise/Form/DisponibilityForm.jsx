import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { daysOfWeek } from "../../Utils/Format/Time";

export default function DisponibilityForm({ onSubmit, initialData, submitLabel }) {
  const isEditing = Boolean(initialData);
  const [days, setDays] = useState(initialData ? [initialData.day] : []);
  const [startHour, setStartHour] = useState(
    initialData ? dayjs(initialData.start_hour, "HH:mm").toDate() : null,
  );
  const [endHour, setEndHour] = useState(
    initialData ? dayjs(initialData.end_hour, "HH:mm").toDate() : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const weekDays = daysOfWeek;

  useEffect(() => {
    if (initialData) {
      setDays([initialData.day]);
      setStartHour(dayjs(initialData.start_hour, "HH:mm").toDate());
      setEndHour(dayjs(initialData.end_hour, "HH:mm").toDate());
    } else {
      setDays([]);
      setStartHour(null);
      setEndHour(null);
    }
  }, [initialData]);

  const toggleDay = (day) => {
    if (isEditing && initialData && day !== initialData.day) {
      return;
    }
    setDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }
      if (isEditing) {
        return [day];
      }
      return [...prev, day];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (days.length === 0) {
      toast.error("Sélectionnez au moins un jour.");
      return;
    }
    if (!startHour || !endHour) {
      toast.error("Sélectionnez une heure de début et de fin.");
      return;
    }
    const formattedStart = dayjs(startHour);
    const formattedEnd = dayjs(endHour);
    if (!formattedStart.isValid() || !formattedEnd.isValid()) {
      toast.error("Les horaires choisis sont invalides.");
      return;
    }
    if (!formattedEnd.isAfter(formattedStart)) {
      toast.error("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    const payload = {
      id: initialData?.id,
      day: isEditing ? days[0] : days,
      start_hour: formattedStart.format("HH:mm"),
      end_hour: formattedEnd.format("HH:mm"),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      if (!isEditing) {
        setDays([]);
        setStartHour(null);
        setEndHour(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelCls = "text-[10px] uppercase tracking-widest text-[#879f98] font-light";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={labelCls}>Jours concernés</p>
            <p className="text-sm font-light text-[#4b615a] mt-0.5">
              Sélectionnez un ou plusieurs jours récurrents pour ce créneau.
            </p>
          </div>
          {isEditing && initialData && (
            <span className="rounded-full border border-[#132A24]/15 bg-[#eef5f1] px-3 py-1 text-xs font-light text-[#132A24]">
              Modification d&apos;un créneau existant
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {weekDays.map((day) => {
            const isSelected = days.includes(day);
            const isLocked = isEditing && initialData && day !== initialData.day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={isLocked}
                className={`rounded-xl border px-3 py-2 text-sm font-light transition ${
                  isSelected
                    ? "border-[#132A24]/20 bg-[#eef5f1] text-[#132A24]"
                    : "border-black/5 bg-[#f5f7f6] text-[#4b615a] hover:bg-[#eef5f1] hover:border-[#132A24]/15"
                } ${isLocked ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Heure de début</label>
          <DatePicker
            selected={startHour}
            onChange={(date) => setStartHour(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            placeholderText="Sélectionnez une heure"
            className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2.5 text-sm text-[#132A24] font-light placeholder:text-[#879f98] focus:border-[#132A24]/30 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Heure de fin</label>
          <DatePicker
            selected={endHour}
            onChange={(date) => setEndHour(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            placeholderText="Sélectionnez une heure"
            className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2.5 text-sm text-[#132A24] font-light placeholder:text-[#879f98] focus:border-[#132A24]/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-3 text-xs text-[#879f98] font-light">
        Astuce : vos créneaux sont récurrents chaque semaine. Pensez à verrouiller
        une date précise si vous êtes indisponible exceptionnellement.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[#879f98] font-light">
          <span className="text-[#132A24]">{days.length || 0}</span>{" "}
          jour(s) sélectionné(s) — plage :{" "}
          <span className="text-[#4b615a]">
            {startHour ? dayjs(startHour).format("HH:mm") : "--:--"} →{" "}
            {endHour ? dayjs(endHour).format("HH:mm") : "--:--"}
          </span>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#132A24] px-6 py-2.5 text-sm font-light text-white transition hover:bg-[#1b3b33] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enregistrement..."
            : submitLabel || (isEditing ? "Mettre à jour" : "Ajouter le créneau")}
        </button>
      </div>
    </form>
  );
}

DisponibilityForm.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    day: PropTypes.string,
    start_hour: PropTypes.string,
    end_hour: PropTypes.string,
  }),
  submitLabel: PropTypes.string,
};

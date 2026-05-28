/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaClock, FaStar } from "react-icons/fa";

function getTodayReservations(enterprise) {
  if (!enterprise?.offers?.length) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const list = [];
  for (const offer of enterprise.offers) {
    for (const r of offer.reservations || []) {
      const d = new Date(r.date);
      if (d >= today && d < tomorrow) {
        list.push({ ...r, offerName: offer.name });
      }
    }
  }
  return list.sort(
    (a, b) => new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`)
  );
}

export default function ReservationSummary({ enterprise, onEdit, onView }) {
  const navigate = useNavigate();
  const todayReservations = getTodayReservations(enterprise);
  const currentDate = new Date().toLocaleDateString();
  const isPremium = enterprise?.isPremium;

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":  return "bg-[#eef5f1] text-[#132A24] border-[#132A24]/15";
      case "pending":   return "bg-amber-50 text-amber-700 border-amber-200";
      case "done":      return "bg-blue-50 text-blue-600 border-blue-200";
      case "cancelled":
      case "rejected":  return "bg-red-50 text-red-500 border-red-200";
      default:          return "bg-black/5 text-[#879f98] border-black/5";
    }
  };

  const ActionButton = ({ icon, label, onClick, accent }) => (
    <button
      onClick={onClick}
      type="button"
      className={`group flex items-center gap-2.5 h-11 px-4 rounded-xl border transition active:scale-[0.98] font-light text-sm
        ${accent
          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500"
          : "bg-[#f5f7f6] border-black/5 text-[#132A24] hover:bg-[#eef5f1]"
        }`}
    >
      <span className={accent ? "" : "text-[#879f98]"}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <FaClock className="text-[#879f98] w-3.5 h-3.5" />
          <p className="text-[#132A24] font-light text-sm">Gestion de mon entreprise</p>
        </div>
        <span className="text-xs text-[#879f98] font-light">
          Réservations du jour — <span className="text-[#4b615a]">{currentDate}</span>
        </span>
      </div>

      {/* Actions + Réservations */}
      <div className="p-5 flex flex-col lg:flex-row gap-5">
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<FaEdit />} label="Modifier l'entreprise" onClick={onEdit} />
          <ActionButton icon={<FaEye />} label="Voir la page entreprise" onClick={onView} />
          {!isPremium && (
            <ActionButton
              icon={<FaStar />}
              label="Devenir Premium"
              onClick={() => navigate(`/subscribe?enterpriseId=${enterprise?.id}`)}
              accent
            />
          )}
          {isPremium && (
            <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-light">
              <FaStar className="w-3.5 h-3.5" />
              Entreprise Premium
            </div>
          )}
        </div>

        {/* Réservations du jour */}
        <div className="flex-1 rounded-xl bg-[#f5f7f6] border border-black/5 p-4 max-h-48 overflow-y-auto">
          {todayReservations.length > 0 ? (
            <div className="divide-y divide-black/5">
              {todayReservations.map((r, idx) => (
                <div key={`${r.offerName}-${r.start_time}-${idx}`} className="py-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <p className="text-[#132A24] font-light min-w-[140px]">{r.offerName}</p>
                  <p className="text-[#879f98] font-light"><span className="text-[#4b615a]">Début :</span> {r.start_time}</p>
                  <p className="text-[#879f98] font-light"><span className="text-[#4b615a]">Fin :</span> {r.end_time}</p>
                  {r.contact_phone && (
                    <p className="text-[#879f98] font-light"><span className="text-[#4b615a]">Tel :</span> {r.contact_phone}</p>
                  )}
                  <span className={`text-[10px] font-light px-2 py-0.5 rounded-full border ${getStatusBadge(r.status)}`}>
                    {r.status || "inconnu"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center h-20 text-[#879f98] text-sm font-light">
              Aucune réservation aujourd&apos;hui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

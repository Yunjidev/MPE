/* eslint-disable react/prop-types */
import { FaCalendarCheck } from "react-icons/fa";

export default function TotalReservations({ count }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 h-32 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl grid place-items-center bg-blue-50 text-blue-500 flex-shrink-0">
        <FaCalendarCheck className="text-xl" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Total réservations</div>
        <div className="mt-1">
          <span className="text-2xl font-light text-[#132A24]">{count ?? 0}</span>
        </div>
        <div className="text-[11px] text-[#879f98] font-light mt-0.5">Depuis l&apos;ouverture des services</div>
      </div>
    </div>
  );
}

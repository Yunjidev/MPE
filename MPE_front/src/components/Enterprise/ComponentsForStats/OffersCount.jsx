/* eslint-disable react/prop-types */
import { FaBriefcase } from "react-icons/fa";

export default function OffersCount({ count }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 h-32 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl grid place-items-center bg-[#eef5f1] text-[#4b8a74] flex-shrink-0">
        <FaBriefcase className="text-xl" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Services publiés</div>
        <div className="mt-1">
          <span className="text-2xl font-light text-[#132A24]">{count ?? 0}</span>
        </div>
        <div className="text-[11px] text-[#879f98] font-light mt-0.5">Offres visibles aux clients</div>
      </div>
    </div>
  );
}

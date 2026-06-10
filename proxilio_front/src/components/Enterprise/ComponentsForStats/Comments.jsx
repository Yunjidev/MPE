/* eslint-disable react/prop-types */
import { LiaComment } from "react-icons/lia";

export default function Comments({ totalComments }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 h-32 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl grid place-items-center bg-[#eef5f1] text-[#4b8a74] flex-shrink-0">
        <LiaComment className="text-2xl" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Commentaires</div>
        <div className="mt-1">
          <span className="text-2xl font-light text-[#132A24]">{totalComments ?? 0}</span>
        </div>
        <div className="text-[11px] text-[#879f98] font-light mt-0.5">Total des avis reçus</div>
      </div>
    </div>
  );
}

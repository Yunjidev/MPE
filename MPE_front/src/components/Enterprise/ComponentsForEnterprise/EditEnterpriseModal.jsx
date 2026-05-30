/* eslint-disable react/prop-types */
import { FaTimes } from "react-icons/fa";
import EditEnterprise from "../EditEnterprise";

export default function EditEnterpriseModal({ enterpriseId, onSave, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-black/5 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-2 relative max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition"
          title="Fermer"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
        <EditEnterprise
          enterpriseId={enterpriseId}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

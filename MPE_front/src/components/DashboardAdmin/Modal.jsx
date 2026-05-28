/* eslint-disable react/prop-types */
import { MdClose } from "react-icons/md";

const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth}`}>
        <div className="relative rounded-2xl bg-white border border-black/5 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-lg text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition"
            aria-label="Fermer"
          >
            <MdClose size={20} />
          </button>
          <div className="p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

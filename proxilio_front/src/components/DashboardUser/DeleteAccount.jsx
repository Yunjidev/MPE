import { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { deleteData } from "../../services/data-fetch";

const DeleteAccount = () => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    );
    if (!confirmation) return;

    try {
      setDeleting(true);
      await deleteData("users/delete");
      alert("Votre compte a été supprimé avec succès.");
      window.location.href = "/logout";
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      alert("Une erreur est survenue lors de la suppression de votre compte.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-8 px-4 flex items-start justify-center">
      <div className="w-full max-w-xl bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="px-6 pt-6 pb-4 border-b border-black/5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Compte</p>
          <h2 className="text-base font-light text-[#132A24] tracking-tight">Supprimer mon compte</h2>
          <p className="text-sm text-[#879f98] font-light mt-0.5">
            Cette action est définitive et supprimera toutes vos données.
          </p>
        </div>

        <div className="px-6 py-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>

          <p className="text-sm text-[#4b615a] font-light max-w-sm leading-relaxed">
            Cette action est irréversible. Toutes vos données seront supprimées de manière permanente. Voulez-vous vraiment continuer ?
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={`h-11 px-8 rounded-xl border border-red-200 bg-red-50 text-red-500 font-light hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-[0.98] transition-all ${
              deleting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {deleting ? "Suppression en cours…" : "Supprimer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;

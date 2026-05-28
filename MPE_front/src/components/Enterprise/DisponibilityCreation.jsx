import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { postData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import DisponibilityForm from "./Form/DisponibilityForm";
import { FiCalendar, FiClock } from "react-icons/fi";

export default function CreateAvailability({ onCreated }) {
  const { id } = useParams();

  const handleSubmit = async (payload) => {
    try {
      await postData(`enterprises/${id}/disponibilites`, payload);
      toast.success("Créneau ajouté avec succès");
      if (typeof onCreated === "function") {
        onCreated();
      }
    } catch (error) {
      try {
        const errorData = JSON.parse(error.message);
        toast.error(errorData.error || errorData.errors || "Erreur inconnue");
      } catch {
        toast.error("Impossible d'ajouter ce créneau.");
      }
    }
  };

  return (
    <section className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#132A24]/15 bg-[#eef5f1] px-3 py-1 text-xs font-light text-[#132A24]">
            <FiClock className="w-3 h-3" />
            Disponibilités
          </span>
          <h3 className="mt-3 text-base font-light text-[#132A24]">
            Ajouter un créneau de disponibilité
          </h3>
          <p className="mt-1.5 max-w-xl text-sm font-light text-[#879f98]">
            Sélectionnez un ou plusieurs jours, définissez vos horaires et
            enrichissez automatiquement le calendrier partagé avec vos clients.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Récurrence hebdomadaire", "Synchronisé au planning client", "Modifiable à tout moment"].map((tag) => (
              <span key={tag} className="rounded-full border border-black/5 bg-[#f5f7f6] px-3 py-1 text-xs font-light text-[#879f98]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-[#132A24]/15 bg-[#eef5f1] text-[#4b8a74] lg:flex">
          <FiCalendar className="text-2xl" />
        </div>
      </div>

      <div className="mt-6 border-t border-black/5 pt-6">
        <DisponibilityForm onSubmit={handleSubmit} />
      </div>
    </section>
  );
}

CreateAvailability.propTypes = {
  onCreated: PropTypes.func,
};

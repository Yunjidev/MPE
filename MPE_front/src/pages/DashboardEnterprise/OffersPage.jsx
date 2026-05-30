import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData, deleteData } from "../../services/data-fetch";
import OfferForm from "../../components/DashboardEnterprise/OfferForm";
import { FaPlus, FaEdit, FaTrash, FaClock, FaEuroSign, FaImage } from "react-icons/fa";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

function OfferModal({ offer, onClose, onSaved }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-black/5 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h2 className="text-[#132A24] font-light text-base">
            {offer ? "Modifier le service" : "Ajouter un service"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#879f98] hover:text-[#132A24] transition"
          >
            <IoCloseCircle className="text-2xl" />
          </button>
        </div>
        <OfferForm offer={offer} onClose={onSaved} />
      </div>
    </div>
  );
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

export default function OffersPage() {
  const { slug } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOffer, setModalOffer] = useState(undefined); // undefined = closed, null = add, object = edit
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchOffers = async () => {
    try {
      const data = await getData(`enterprise/${slug}`);
      setOffers(data.offers || []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [slug]);

  const handleDelete = async (offerId) => {
    try {
      await deleteData(`enterprise/${slug}/offer/${offerId}`);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch {
      // silently ignore
    }
    setConfirmDelete(null);
  };

  const handleSaved = () => {
    setModalOffer(undefined);
    fetchOffers();
  };

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6 mt-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">
            Entreprise
          </p>
          <h1 className="text-xl font-light text-[#132A24] tracking-tight">Mes services</h1>
          <p className="text-sm text-[#879f98] font-light mt-0.5">
            Gérez les offres proposées par votre entreprise.
          </p>
        </div>
        <button
          onClick={() => setModalOffer(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-sm transition active:scale-95"
        >
          <FaPlus />
          Ajouter un service
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[#f5f7f6] animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#eef5f1] flex items-center justify-center mb-4">
            <FaImage className="text-[#879f98] text-2xl" />
          </div>
          <p className="text-[#132A24] font-light mb-1">Aucun service pour l&apos;instant</p>
          <p className="text-[#879f98] text-sm font-light mb-6">
            Ajoutez vos premières offres pour que vos clients puissent réserver.
          </p>
          <button
            onClick={() => setModalOffer(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-sm transition"
          >
            <FaPlus />
            Ajouter un service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative bg-[#f5f7f6] border border-black/5 rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] transition"
            >
              {/* Image */}
              <div className="h-36 bg-[#eef5f1] flex items-center justify-center overflow-hidden">
                {offer.image ? (
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage className="text-[#879f98] text-3xl" />
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[#132A24] font-light text-sm leading-snug">{offer.name}</h3>
                  {offer.estimate && (
                    <span className="shrink-0 text-[10px] font-light px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                      Estimation
                    </span>
                  )}
                </div>

                {offer.description && (
                  <p className="text-[#879f98] text-xs font-light line-clamp-2 mb-3">{offer.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-[#879f98] font-light">
                  <span className="flex items-center gap-1">
                    <FaEuroSign className="text-[#4b8a74]" />
                    {offer.price} €
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[#4b8a74]" />
                    {formatDuration(offer.duration)}
                  </span>
                </div>
              </div>

              {/* Actions — hover overlay sur desktop, boutons fixes sur mobile */}
              <div className="hidden sm:flex absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3">
                <button
                  onClick={() => setModalOffer(offer)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white text-[#132A24] text-sm font-light hover:bg-[#eef5f1] transition"
                >
                  <FaEdit />
                  Modifier
                </button>
                <button
                  onClick={() => setConfirmDelete(offer)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-500 text-sm font-light hover:bg-red-100 transition"
                >
                  <FaTrash />
                  Supprimer
                </button>
              </div>
              <div className="sm:hidden flex gap-2 px-4 pb-3">
                <button
                  onClick={() => setModalOffer(offer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-black/10 bg-white text-[#132A24] text-xs font-light transition active:scale-95"
                >
                  <FaEdit />
                  Modifier
                </button>
                <button
                  onClick={() => setConfirmDelete(offer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-500 text-xs font-light transition active:scale-95"
                >
                  <FaTrash />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modalOffer !== undefined && (
        <OfferModal
          offer={modalOffer}
          onClose={() => setModalOffer(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white border border-black/5 rounded-2xl p-6 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#132A24] font-light text-base mb-2">Supprimer le service</h3>
            <p className="text-[#4b615a] text-sm font-light mb-6">
              Êtes-vous sûr de vouloir supprimer <strong className="text-[#132A24]">{confirmDelete.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-[#4b615a] hover:bg-[#f5f7f6] text-sm font-light transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white text-sm font-light transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

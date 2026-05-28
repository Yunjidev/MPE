/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";

const OfferForm = ({ offer, onClose = () => {} }) => {
  const { slug } = useParams();
  const isEdit = !!offer; // Vérification si on modifie une offre existante ou non

  const [formData, setFormData] = useState({
    name: offer ? offer.name : "",
    description: offer ? offer.description : "",
    duration: offer ? offer.duration : "",
    price: offer ? offer.price : "",
    estimate: offer ? offer.estimate : false,
    image: null,
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || "",
        description: offer.description || "",
        duration: offer.duration || "",
        price: offer.price || "",
        estimate: offer.estimate || false,
        image: null, // Réinitialise l'image lors de la modification
      });
    }
  }, [offer]);

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    
    if (type === "file") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: files[0],
      }));
    } else if (type === "checkbox") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: checked,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("estimate", formData.estimate);
  
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    
    try {
      let response;
  
      if (isEdit) {
        response = await putData(`enterprise/${slug}/offer/${offer.id}`, formDataToSend);
      } else {
        response = await postData(`enterprise/${slug}/offer`, formDataToSend);
      }

      if (response.message === 'Offre créée') {
        toast.success("Offre créée avec succès !");
      } else if (response.message === 'Offre modifiée') {
        toast.success("Offre modifiée avec succès !");
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission de l'offre:", error);
      toast.error("Une erreur est survenue lors de la soumission de l'offre.");
    }
  };

  const inputCls = "w-full p-2.5 rounded-xl bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] font-light focus:outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 text-sm transition";
  const labelCls = "block text-[10px] font-light uppercase tracking-widest text-[#879f98] mb-1";

  return (
    <div className="w-full p-6">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Service</p>
        <h2 className="text-base font-light text-[#132A24]">
          {offer ? "Modifier l'offre" : "Créer une nouvelle offre"}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: "name",        label: "Nom du service",    type: "text",   placeholder: "ex. Coupe homme" },
          { id: "description", label: "Description",       type: "text",   placeholder: "Décrivez votre service…" },
          { id: "duration",    label: "Durée (minutes)",   type: "number", placeholder: "ex. 60" },
          { id: "price",       label: "Prix (€)",          type: "number", placeholder: "ex. 25" },
        ].map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className={labelCls}>{label}</label>
            <input
              type={type}
              id={id}
              value={formData[id]}
              onChange={handleChange}
              className={inputCls}
              placeholder={placeholder}
              required
            />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="estimate"
            checked={formData.estimate}
            onChange={handleChange}
            className="w-4 h-4 accent-[#132A24]"
          />
          <label htmlFor="estimate" className="text-sm text-[#4b615a] font-light">
            Prix indicatif (estimation uniquement)
          </label>
        </div>
        <div>
          <label htmlFor="image" className={labelCls}>Image du service</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 rounded-xl bg-[#f5f7f6] border border-black/5 text-[#879f98] text-sm font-light file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#eef5f1] file:text-[#132A24] file:text-xs file:font-light file:cursor-pointer"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#f5f7f6] text-sm transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-sm transition active:scale-95"
          >
            {offer ? "Enregistrer les modifications" : "Créer le service"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;

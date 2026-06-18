/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";

function parseDurationFromMinutes(minutes) {
  const val = Number(minutes);
  if (!val || val === 0) return { unit: "quote", value: "" };
  if (val >= 1440 && val % 1440 === 0) return { unit: "days", value: String(val / 1440) };
  return { unit: "minutes", value: String(val) };
}

function durationToMinutes(unit, value) {
  if (unit === "quote") return 0;
  const n = parseInt(value, 10) || 0;
  return unit === "days" ? n * 1440 : n;
}

const OfferForm = ({ offer, onClose = () => {} }) => {
  const { slug } = useParams();
  const isEdit = !!offer;

  const initDuration = offer ? parseDurationFromMinutes(offer.duration) : { unit: "minutes", value: "" };

  const [formData, setFormData] = useState({
    name: offer ? offer.name : "",
    description: offer ? offer.description : "",
    durationValue: initDuration.value,
    durationUnit: initDuration.unit,
    price: offer ? offer.price : "",
    estimate: offer ? offer.estimate : false,
    image: null,
  });

  useEffect(() => {
    if (offer) {
      const d = parseDurationFromMinutes(offer.duration);
      setFormData({
        name: offer.name || "",
        description: offer.description || "",
        durationValue: d.value,
        durationUnit: d.unit,
        price: offer.price || "",
        estimate: offer.estimate || false,
        image: null,
      });
    }
  }, [offer]);

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("duration", durationToMinutes(formData.durationUnit, formData.durationValue));
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

      if (response.message === "Offre créée") {
        toast.success("Offre créée avec succès !");
      } else if (response.message === "Offre modifiée") {
        toast.success("Offre modifiée avec succès !");
      }
      onClose();
    } catch (error) {
      let message = "Une erreur est survenue.";
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed?.errors)) {
          message = parsed.errors.map((e) => e.msg).join(" • ");
        } else if (typeof parsed?.errors === "string") {
          message = parsed.errors;
        }
      } catch {
        // keep generic message
      }
      toast.error(message);
    }
  };

  const inputCls = "w-full p-2.5 rounded-xl bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] font-light focus:outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 text-sm transition";
  const labelCls = "block text-[10px] font-light uppercase tracking-widest text-[#879f98] mb-1";

  const durationUnits = [
    { value: "minutes", label: "Minutes" },
    { value: "days",    label: "Jours" },
    { value: "quote",   label: "Sur devis" },
  ];

  return (
    <div className="w-full p-6">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Service</p>
        <h2 className="text-base font-light text-[#132A24]">
          {offer ? "Modifier l'offre" : "Créer une nouvelle offre"}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label htmlFor="name" className={labelCls}>
            Nom du service <span className="normal-case tracking-normal">(3–50 caractères)</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={inputCls}
            placeholder="ex. Refonte site vitrine"
            maxLength={50}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelCls}>Description</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className={inputCls}
            placeholder="Décrivez votre service…"
          />
        </div>

        {/* Durée */}
        <div>
          <label className={labelCls}>Durée</label>
          <div className="flex gap-2">
            <div className="flex rounded-xl border border-black/5 overflow-hidden bg-[#f5f7f6] shrink-0">
              {durationUnits.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, durationUnit: value }))}
                  className={`px-3 py-2.5 text-xs font-light transition ${
                    formData.durationUnit === value
                      ? "bg-[#132A24] text-white"
                      : "text-[#879f98] hover:text-[#132A24]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {formData.durationUnit !== "quote" && (
              <input
                type="number"
                id="durationValue"
                value={formData.durationValue}
                onChange={handleChange}
                className={inputCls}
                placeholder={formData.durationUnit === "days" ? "ex. 3" : "ex. 60"}
                min={1}
                required
              />
            )}
          </div>
        </div>

        {/* Prix */}
        <div>
          <label htmlFor="price" className={labelCls}>Prix (€)</label>
          <input
            type="number"
            id="price"
            value={formData.price}
            onChange={handleChange}
            className={inputCls}
            placeholder="ex. 25"
            required
          />
        </div>

        {/* Estimation */}
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

        {/* Image */}
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

/* eslint-disable no-unused-vars */
import { useState } from "react";
import { putData } from "../../services/data-fetch";
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";

export default function UpdatePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);

  const onSubmitHandler = async (data) => {
    setError(null);
    setSuccess(null);

    if (data.password !== data.passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("current_password", data.current_password.trim());
      fd.append("password", data.password.trim());
      fd.append("passwordConfirmation", data.passwordConfirmation.trim());
      const response = await putData("user/update", fd);
      if (response?.error) {
        setError(response.error.message || "Erreur lors du changement de mot de passe.");
      } else {
        setSuccess("Mot de passe mis à jour avec succès !");
        reset();
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Erreur lors du changement de mot de passe.");
    } finally {
      setSubmitting(false);
    }
  };

  const baseInput =
    "w-full pl-10 pr-12 h-11 rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] " +
    "border border-black/5 outline-none ring-0 font-light " +
    "focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";

  const eyeBtn =
    "absolute top-1/2 -translate-y-1/2 right-3 h-8 w-8 flex items-center justify-center rounded-lg text-[#879f98] " +
    "hover:text-[#132A24] hover:bg-[#eef5f1] transition";

  const field = ({ id, icon, type, show, setShow, placeholder, reg }) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98]">{icon}</span>
      <input
        id={id}
        type={show ? "text" : type}
        placeholder={placeholder}
        className={baseInput}
        {...reg}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className={eyeBtn}
        aria-label={show ? "Masquer" : "Afficher"}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );

  return (
    <div className="py-8 px-4 flex items-start justify-center">
      <div className="w-full max-w-xl bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="px-6 pt-6 pb-4 border-b border-black/5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Compte</p>
          <h2 className="text-base font-light text-[#132A24] tracking-tight">Changer le mot de passe</h2>
          <p className="text-sm text-[#879f98] font-light mt-0.5">
            Entrez l&apos;ancien mot de passe, puis votre nouveau mot de passe.
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col gap-4">
            {field({
              id: "current_password",
              icon: <FaLock className="w-3.5 h-3.5" />,
              type: "password",
              show: showOld,
              setShow: setShowOld,
              placeholder: "Ancien mot de passe",
              reg: register("current_password", { required: "L'ancien mot de passe est requis" }),
            })}
            {errors.current_password && (
              <span className="text-red-400 text-xs font-light">{errors.current_password.message}</span>
            )}

            {field({
              id: "password",
              icon: <FaLock className="w-3.5 h-3.5" />,
              type: "password",
              show: showNew,
              setShow: setShowNew,
              placeholder: "Nouveau mot de passe",
              reg: register("password", {
                required: "Le mot de passe est requis",
                minLength: { value: 8, message: "Minimum 8 caractères" },
              }),
            })}
            {errors.password && <span className="text-red-400 text-xs font-light">{errors.password.message}</span>}

            {field({
              id: "passwordConfirmation",
              icon: <FaKey className="w-3.5 h-3.5" />,
              type: "password",
              show: showNew2,
              setShow: setShowNew2,
              placeholder: "Confirmer le nouveau mot de passe",
              reg: register("passwordConfirmation", {
                required: "La confirmation est requise",
              }),
            })}
            {errors.passwordConfirmation && (
              <span className="text-red-400 text-xs font-light">{errors.passwordConfirmation.message}</span>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full h-11 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] active:scale-[0.98] transition-all ${
                  submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "En cours…" : "Changer le mot de passe"}
              </button>
            </div>

            {error && <div className="text-red-500 text-center text-sm font-light">{error}</div>}
            {success && <div className="text-[#4b8a74] text-center text-sm font-light">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

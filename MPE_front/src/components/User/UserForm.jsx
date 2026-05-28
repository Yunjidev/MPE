import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { toast } from "react-toastify";
import Button from "../Button/button";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import Input from "../Utils/Inputs/Input"; // doit exposer Input.Text et Input.SingleUpload
import Inscription from "./Form/Inscription";
import Edit from "./Form/Edit";

const innerWidthClass = "w-10/12 mx-auto";

export default function UserForm({ onSubmit, mode }) {
  const [user] = useAtom(userAtom);

  const isConnexion = mode === "Connexion";
  const isInscription = mode === "Inscription";
  const isEdit = mode === "Edition"; // IMPORTANT: on aligne sur "Edition"

  const [formData, setFormData] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate le form en mode édition
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        username: user?.username ?? "",
        email: user?.email ?? "",
        firstname: user?.firstname ?? "",
        lastname: user?.lastname ?? "",
        avatar: user?.avatar ?? null,
      });
    }
  }, [isEdit, user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      avatar: file || null,
      removeAvatar: !file || undefined,
    }));
  };

  const handleAvatarDelete = () => {
    setFormData((prev) => ({ ...prev, avatar: null, removeAvatar: true }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (isSubmitting) return;

    // Validation simple inscription
    if (isInscription && confirmPassword !== (formData.password || "")) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEdit) {
        // Envoi sélectif des champs modifiés
        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
          const val = formData[key];
          const initial = user?.[key];

          const shouldSend =
            val !== null &&
            val !== undefined &&
            val !== "" &&
            (val !== initial || (key === "removeAvatar" && val === true));

          if (shouldSend) {
            formDataToSend.append(key, val);
          }
        });

        await onSubmit(formDataToSend);
      } else {
        await onSubmit(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isEdit ? "" : "w-full max-w-md"}>
      <div
        className={
          isEdit
            ? ""
            : "bg-white border border-black/5 rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
        }
      >
        <div className={isEdit ? "p-6" : "p-8 lg:p-10"}>
          {/* Header — non-edit only */}
          {!isEdit && (
            <div className="mb-8 text-center">
              <img src="/assets/img/logo.png" alt="Proxilio" className="h-14 mx-auto mb-6 object-contain" />
              <h2 className="text-2xl font-light tracking-tight text-[#132A24]">
                {isConnexion ? "Connexion" : "Créer un compte"}
              </h2>
              <p className="mt-1.5 text-sm font-light text-[#879f98]">
                Entrez vos informations pour continuer.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Upload avatar seulement en édition */}
            {isEdit && (
              <Input.SingleUpload
                placeholder="Sélectionnez un avatar"
                onFileUpload={handleAvatarChange}
                onFileDelete={handleAvatarDelete}
                url={formData.avatar}
                isEditMode={true}
              />
            )}

            {/* Connexion vs Inscription/Edition */}
            {isConnexion ? (
              <div className="space-y-4">
                <Input.Text
                  id="identifier"
                  value={formData.identifier || ""}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur / Email"
                  icon={<FaUser className="opacity-70" />}
                />
              </div>
            ) : (
              // ⚠️ Si tes sous-formulaires attendent `formData` et non `fomData`,
              // renomme la prop dans Inscription/Edit.
              <Inscription
                fomData={formData}
                onChange={handleInputChange}
                className={isEdit ? innerWidthClass : ""}
              />
            )}

            {/* Compléments spécifiques Edition */}
            {isEdit && (
              <Edit
                fomData={formData}
                onChange={handleInputChange}
                className={innerWidthClass}
              />
            )}

            {/* Mot de passe (Connexion & Inscription) */}
            {(isConnexion || isInscription) && (
              <Input.Text
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={handleInputChange}
                placeholder="Mot de passe"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="p-1 -mr-1 rounded hover:bg-[#eef5f1] focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 text-[#879f98] hover:text-[#132A24] transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />
            )}

            {/* Confirmation (Inscription) */}
            {isInscription && (
              <Input.Text
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmation du mot de passe"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="p-1 -mr-1 rounded hover:bg-[#eef5f1] focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 text-[#879f98] hover:text-[#132A24] transition-colors"
                    aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />
            )}

            {/* Actions */}
            <div className="pt-2">
              {isEdit ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full md:w-2/3 mx-auto block
                    rounded-xl
                    bg-[#132A24] text-white hover:bg-[#1b3b33]
                    active:scale-[0.98]
                    font-light py-3 px-6 tracking-tight
                    transition-all duration-200
                    ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  {isSubmitting ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi…" : mode}
                </Button>
              )}
            </div>

            {/* Lien mdp oublié */}
            {mode === "Connexion" && (
              <div className="text-right">
                <a
                  className="text-[#4b8a74] hover:text-[#132A24] text-sm font-light underline underline-offset-4 transition-colors"
                  href="http://localhost:5173/forgot-password"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["Connexion", "Inscription", "Edition"]).isRequired,
};

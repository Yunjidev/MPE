import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postData } from "../../services/data-fetch";
import { Helmet } from "react-helmet-async";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      await postData(`reset-password/${token}`, { newPassword: data.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch {
      setServerError("Le lien est invalide ou expiré. Faites une nouvelle demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Nouveau mot de passe | Proxilio</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {success ? (
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#eef5f1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-light text-[#132A24] tracking-tight mb-2">Mot de passe modifié</h2>
                <p className="text-sm text-[#879f98] font-light">Vous allez être redirigé vers la connexion…</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-6 text-center">
                Nouveau mot de passe
              </p>
              <h1 className="text-2xl font-light text-[#132A24] tracking-tight mb-8 text-center">
                Choisissez un nouveau mot de passe
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    {...register("newPassword", {
                      required: "Le mot de passe est requis.",
                      minLength: { value: 8, message: "8 caractères minimum." },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#f5f7f6] text-[#132A24] placeholder-[#879f98] text-sm font-light focus:outline-none focus:border-[#132A24]/30 focus:bg-white transition"
                  />
                  {errors.newPassword && (
                    <span className="text-red-400 text-xs font-light">{errors.newPassword.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    {...register("confirmPassword", {
                      required: "La confirmation est requise.",
                      validate: (value) => value === newPassword || "Les mots de passe ne correspondent pas.",
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#f5f7f6] text-[#132A24] placeholder-[#879f98] text-sm font-light focus:outline-none focus:border-[#132A24]/30 focus:bg-white transition"
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-400 text-xs font-light">{errors.confirmPassword.message}</span>
                  )}
                </div>

                {serverError && (
                  <p className="text-red-400 text-sm font-light text-center">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#132A24] text-white text-sm font-light tracking-tight hover:bg-[#1e3d33] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                </button>
              </form>

              {serverError && (
                <p className="mt-6 text-center text-sm font-light text-[#879f98]">
                  <Link to="/forgot-password" className="text-[#132A24] underline underline-offset-4 hover:text-[#4b8a74] transition-colors">
                    Faire une nouvelle demande
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

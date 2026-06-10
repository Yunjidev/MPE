import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../services/data-fetch";
import { Helmet } from "react-helmet-async";

const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      await postData("forgot-password", { email: data.email });
      setSent(true);
    } catch {
      setServerError("Aucun compte associé à cette adresse e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Mot de passe oublié | Proxilio</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {sent ? (
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#eef5f1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-light text-[#132A24] tracking-tight mb-2">Email envoyé</h2>
                <p className="text-sm text-[#879f98] font-light leading-relaxed max-w-sm">
                  Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation valable <strong className="text-[#132A24] font-normal">1 heure</strong>.
                </p>
              </div>
              <Link to="/signin" className="text-sm text-[#879f98] hover:text-[#132A24] underline underline-offset-4 font-light transition-colors">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-6 text-center">
                Mot de passe oublié
              </p>
              <h1 className="text-2xl font-light text-[#132A24] tracking-tight mb-2 text-center">
                Réinitialiser votre mot de passe
              </h1>
              <p className="text-sm text-[#879f98] font-light text-center mb-8">
                Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    placeholder="Votre adresse e-mail"
                    {...register("email", {
                      required: "L'email est requis.",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide." },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#f5f7f6] text-[#132A24] placeholder-[#879f98] text-sm font-light focus:outline-none focus:border-[#132A24]/30 focus:bg-white transition"
                  />
                  {errors.email && (
                    <span className="text-red-400 text-xs font-light">{errors.email.message}</span>
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
                  {loading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm font-light text-[#879f98]">
                <Link to="/signin" className="text-[#132A24] underline underline-offset-4 hover:text-[#4b8a74] transition-colors">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;

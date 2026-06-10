import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getData } from "../../services/data-fetch";

export default function SubscribeSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Session introuvable.");
      return;
    }
    getData(`stripe/verify-session/${sessionId}`)
      .then(() => setStatus("success"))
      .catch((err) => {
        const parsed = JSON.parse(err.message || "{}");
        if (parsed.alreadyProcessed) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(parsed.error || "Erreur lors de l'activation du premium.");
        }
      });
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#879f98] font-light text-sm">
          <svg className="animate-spin h-7 w-7 text-[#132A24]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Activation de votre abonnement…
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Erreur</p>
          <h1 className="text-2xl font-light text-[#132A24] mb-2">Une erreur est survenue</h1>
          <p className="text-[#879f98] font-light text-sm mb-8">{message}</p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#eef5f1] transition text-sm"
          >
            Retour aux tarifs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Icône succès */}
        <div className="w-20 h-20 rounded-full bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-9 h-9 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-light uppercase tracking-widest rounded-full border border-amber-200 bg-amber-50 text-amber-700 mb-5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Abonnement Premium activé
        </span>

        <h1 className="text-3xl font-light text-[#132A24] tracking-tight mb-3">
          Bienvenue dans le Premium&nbsp;!
        </h1>
        <p className="text-[#879f98] font-light text-sm leading-relaxed mb-10">
          Votre entreprise bénéficie désormais de toutes les fonctionnalités premium — mise en avant, priorité dans les recherches et accès complet au dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-sm transition active:scale-[0.98]"
          >
            Accéder au dashboard
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-black/10 text-[#4b615a] font-light text-sm hover:bg-[#eef5f1] transition"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

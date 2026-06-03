import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { enterprisesAtom } from "../../store/enterprises";
import { authGoogle } from "../../services/auth-fetch";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({ redirectTo }) {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUser] = useAtom(userAtom);
  const [, setEnterprises] = useAtom(enterprisesAtom);

  const destination =
    redirectTo ||
    new URLSearchParams(location.search).get("redirect") ||
    "/dashboard/user-db";

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: buttonRef.current.offsetWidth || 400,
      text: "continue_with",
      locale: "fr",
    });
  }, []);

  async function handleCredentialResponse(response) {
    try {
      const userData = await authGoogle(response.credential);
      setUser({ ...userData.user, isLogged: true });
      setEnterprises(userData.enterprises || []);
      navigate(destination);
      toast.success("Authentification Google réussie");
    } catch {
      toast.error("Échec de la connexion avec Google");
    }
  }

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-xs text-[#879f98] font-light">ou</span>
        <div className="flex-1 h-px bg-black/10" />
      </div>
      <div ref={buttonRef} className="w-full flex justify-center" />
    </div>
  );
}

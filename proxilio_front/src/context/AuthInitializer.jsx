import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Cookies from "js-cookie";
import { userAtom } from "../store/user";
import { enterprisesAtom } from "../store/enterprises";
import { validateRefreshToken } from "../services/checkToken";

export default function AuthInitializer({ children }) {
  const [user, setUser] = useAtom(userAtom);
  const [, setEnterprises] = useAtom(enterprisesAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasCookie = !!Cookies.get("mpe-refresh");

    if (user.isLogged && hasCookie) {
      // Session déjà active et cookie présent — pas besoin de restaurer
      setReady(true);
      return;
    }

    if (!hasCookie) {
      // Pas de cookie refresh — on s'assure que l'état est bien déconnecté
      if (user.isLogged) setUser((u) => ({ ...u, isLogged: false }));
      setReady(true);
      return;
    }

    // Cookie présent mais isLogged false (localStorage vidé) — restauration
    validateRefreshToken()
      .then((result) => {
        if (result?.user) {
          setUser({ ...result.user, isLogged: true });
          setEnterprises(result.enterprises || []);
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return children;
}

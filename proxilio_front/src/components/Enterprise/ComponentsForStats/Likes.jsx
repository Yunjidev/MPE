/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef } from "react";
import { FaHeart } from "react-icons/fa";
import { getData } from "../../../services/data-fetch";
import { useAtom } from "jotai";
import { userAtom } from "../../../store/user";

function pickEnterpriseId(like) {
  return (
    like?.enterprise_id ??
    like?.Enterprise_id ??
    like?.entreprise_id ??
    like?.enterpriseId ??
    like?.EnterpriseId ??
    like?.entrepriseId ??
    like?.enterprise?.id ??
    like?.Enterprise?.id ??
    like?.entreprise?.id ??
    null
  );
}

export default function Likes({ enterpriseId: enterpriseIdProp }) {
  const [user] = useAtom(userAtom);
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);
  const triedEnterpriseLikes404 = useRef(false);

  const enterpriseId = useMemo(() => {
    if (enterpriseIdProp != null) return String(enterpriseIdProp);
    const idFromUser = user?.enterprise?.id ?? user?.currentEnterpriseId ?? null;
    return idFromUser != null ? String(idFromUser) : null;
  }, [enterpriseIdProp, user]);

  useEffect(() => {
    let alive = true;

    async function fetchLikes() {
      setError(null);
      setCount(null);

      if (!enterpriseId) {
        if (alive) setCount(0);
        return;
      }

      if (!triedEnterpriseLikes404.current) {
        try {
          const res = await getData(`enterprise/${enterpriseId}/likes`);
          const arr = Array.isArray(res) ? res : [];
          if (!alive) return;
          setCount(arr.length);
          return;
        } catch (e) {
          const msg = String(e?.message || "");
          if (msg.includes("404")) triedEnterpriseLikes404.current = true;
        }
      }

      try {
        try {
          const filtered = await getData(`likes?enterprise_id=${enterpriseId}`);
          if (Array.isArray(filtered)) {
            if (!alive) return;
            setCount(filtered.length);
            return;
          }
        } catch {
          // ignore
        }

        const all = await getData(`likes`);
        const arr = Array.isArray(all) ? all : [];
        const onlyThisEnterprise = arr.filter(
          (l) => String(pickEnterpriseId(l)) === enterpriseId
        );

        if (!alive) return;
        setCount(onlyThisEnterprise.length);
      } catch (e) {
        if (!alive) return;
        setCount(0);
        setError("Impossible de récupérer les favoris.");
        console.warn("[Likes] erreur:", e);
      }
    }

    fetchLikes();
    return () => { alive = false; };
  }, [enterpriseId]);

  return (
    <div
      className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 h-32 flex items-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 rounded-xl grid place-items-center bg-red-50 text-red-400 flex-shrink-0">
        <FaHeart className="text-xl" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Favoris</div>

        {error ? (
          <div className="text-sm text-red-500 font-light mt-1">{error}</div>
        ) : count === null ? (
          <div className="mt-1 h-6 w-16 rounded-lg bg-[#f5f7f6] animate-pulse" />
        ) : (
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-light text-[#132A24]">{count}</span>
            <span className="text-xs text-[#879f98] font-light">ajouts aux favoris</span>
          </div>
        )}

        <div className="text-[11px] text-[#879f98] font-light mt-0.5">
          Total de likes reçus par l&apos;entreprise
        </div>
      </div>
    </div>
  );
}

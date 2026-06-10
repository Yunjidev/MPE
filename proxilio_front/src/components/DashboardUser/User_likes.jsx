/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { getData } from "../../services/data-fetch";
import { useNavigate } from "react-router-dom";
import LikeButton from "../CardsEntreprises/LikesForCards/LikeButton";

const LikesManagement = () => {
  const [favorites, setFavorites] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const likes = await getData("likes");
        setFavorites(likes);
        const enterpriseIds = likes.map((like) => Number(like.Enterprise_id));
        const uniqueIds = [...new Set(enterpriseIds)].filter(Boolean);
        const data = await Promise.all(uniqueIds.map((id) => getData(`enterprise/${id}`)));
        const map = data.reduce((acc, e) => { if (e?.id) acc[Number(e.id)] = e; return acc; }, {});
        setEnterprises(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = (enterpriseId) => {
    const eid = Number(enterpriseId);
    setFavorites((prev) => prev.filter((f) => Number(f.Enterprise_id) !== eid));
  };

  if (loading) {
    return <p className="text-sm text-[#879f98] font-light">Chargement…</p>;
  }

  if (!favorites.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#eef5f1] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <p className="text-sm text-[#879f98] font-light">
          Aucun favori pour l&apos;instant. Ajoutez-en depuis les fiches entreprises.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#879f98] font-light mb-3">{favorites.length} entreprise{favorites.length > 1 ? "s" : ""} en favori</p>
      <ul className="space-y-2">
        {favorites.map((favorite) => {
          const eid = Number(favorite.Enterprise_id);
          const uid = Number(favorite.User_id);
          const ent = enterprises[eid];
          return (
            <li
              key={favorite.id}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2.5 hover:bg-[#eef5f1] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <LikeButton userId={uid} enterpriseId={eid} onUnlike={removeFavorite} />
                <div className="min-w-0">
                  <p className="text-sm font-light text-[#132A24] tracking-tight truncate">
                    {ent?.name ?? "(entreprise indisponible)"}
                  </p>
                  {ent?.city && (
                    <p className="text-xs text-[#879f98] font-light truncate">{ent.city}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/enterprise/${ent?.slug || eid}`)}
                className="flex-shrink-0 text-xs font-light text-[#132A24] border border-[#132A24]/15 px-3 py-1.5 rounded-full hover:bg-[#132A24] hover:text-white transition-colors ml-2"
              >
                Voir fiche
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LikesManagement;

import { useState, useEffect } from "react";
import { getData } from "../../../services/data-fetch";
import { FaEye, FaStar, FaMapMarkerAlt, FaBriefcase, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PremiumCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getData("enterprises/premium")
      .then(setCompanies)
      .catch((e) => console.error("Error fetching companies:", e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.job?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  if (loading) {
    return <p className="text-sm text-[#879f98] font-light py-6">Chargement…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher par nom, ville ou métier…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
        className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2.5 text-sm text-[#132A24] placeholder:text-[#879f98] font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition"
      />

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-10 text-center text-sm text-[#879f98] font-light">
          Aucune entreprise premium trouvée.
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 flex items-center gap-4 hover:bg-[#eef5f1] transition"
            >
              {/* Logo */}
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-10 h-10 rounded-xl border border-black/5 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl border border-black/5 bg-white flex items-center justify-center text-[#879f98] text-sm font-light flex-shrink-0">
                  {company.name?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Infos principales */}
              <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-sm font-light text-[#132A24] truncate">{company.name}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-light text-amber-600 mt-0.5">
                    <FaStar className="w-2.5 h-2.5 text-amber-400" />
                    {company.averageRating ? Number(company.averageRating).toFixed(1) : "—"} / 5
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#879f98] font-light">
                  <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{[company.city, company.zip_code].filter(Boolean).join(" ") || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#879f98] font-light">
                  <FaBriefcase className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{company.job?.name || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#879f98] font-light">
                  <FaUser className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{company.entrepreneur?.username || "—"}</span>
                </div>
              </div>

              {/* Bouton voir */}
              <button
                onClick={() => navigate(`/enterprise/${company.slug || company.id}`)}
                className="h-8 w-8 rounded-lg border border-black/5 bg-white flex items-center justify-center text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition flex-shrink-0"
                title="Voir la page entreprise"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
            className="h-9 px-4 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#eef5f1] disabled:opacity-40 transition text-sm"
          >
            Précédent
          </button>
          <span className="text-xs text-[#879f98] font-light">
            Page {pageIndex + 1} / {pageCount || 1} · {filtered.length} entreprise{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setPageIndex((p) => Math.min(p + 1, pageCount - 1))}
            disabled={pageIndex >= pageCount - 1}
            className="h-9 px-4 rounded-xl border border-black/10 text-[#4b615a] font-light hover:bg-[#eef5f1] disabled:opacity-40 transition text-sm"
          >
            Suivant
          </button>
        </div>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
          className="rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
};

export default PremiumCompanies;

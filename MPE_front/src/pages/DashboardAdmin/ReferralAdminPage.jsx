import { useState, useEffect, useCallback } from "react";
import { getData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoPeopleOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoGiftOutline, IoSearchOutline } from "react-icons/io5";

function StatCard({ icon, label, value, sub, color = "#132A24" }) {
  return (
    <div className="bg-[#f5f7f6] rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-light text-[#132A24] leading-none">{value}</p>
        <p className="text-xs text-[#879f98] font-light mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-[#879f98] font-light mt-0.5 opacity-70">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 5 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
        <div className="h-full bg-[#132A24] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-[#879f98] font-light tabular-nums w-8 text-right">{value}/5</span>
    </div>
  );
}

export default function ReferralAdminPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page, limit: 25, ...(debouncedSearch && { search: debouncedSearch }) });
      const res = await getData(`admin/referrals?${qs}`);
      setData(res);
    } catch {
      toast.error("Impossible de charger les parrainages.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = data?.stats;
  const referrals = data?.referrals || [];
  const topReferrers = data?.top_referrers || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
        <h2 className="text-xl font-light text-[#132A24] tracking-tight">Suivi des parrainages</h2>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<IoPeopleOutline />}            label="Parrainages total"   value={stats?.total_referrals ?? "—"} />
        <StatCard icon={<IoCheckmarkCircleOutline />}   label="Validés"             value={stats?.validated ?? "—"}       color="#16a34a" />
        <StatCard icon={<IoTimeOutline />}              label="En attente"          value={stats?.pending ?? "—"}         color="#d97706" />
        <StatCard icon={<IoGiftOutline />}              label="Mois Premium offerts" value={stats?.rewards_issued ?? "—"} sub="1 récompense / 5 validés" color="#7c3aed" />
      </div>

      {/* Top parrains */}
      {topReferrers.length > 0 && (
        <div className="bg-white border border-black/5 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Top parrains</p>
          <div className="space-y-3">
            {topReferrers.map((r, i) => (
              <div key={r.user?.id ?? i} className="flex items-center gap-3">
                <span className="w-5 text-xs font-light text-[#879f98] text-right shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <span className="text-sm font-light text-[#132A24] truncate block">
                        {r.user?.firstname && r.user?.lastname
                          ? `${r.user.firstname} ${r.user.lastname}`
                          : (r.user?.username || r.user?.email || "—")}
                      </span>
                      <span className="text-[10px] text-[#879f98] font-light truncate block">{r.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <span className="text-sm font-light text-[#132A24]">{r.validated}</span>
                        <span className="text-[10px] text-[#879f98] font-light"> validés</span>
                      </div>
                      <div>
                        <span className="text-sm font-light text-[#132A24]">{r.rewards_claimed}</span>
                        <span className="text-[10px] text-[#879f98] font-light"> mois offerts</span>
                      </div>
                    </div>
                  </div>
                  <ProgressBar value={r.progress} max={5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste détaillée */}
      <div className="bg-white border border-black/5 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light flex-1">
            Tous les parrainages {pagination && <span>({pagination.total})</span>}
          </p>
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98] text-sm" />
            <input
              type="text"
              placeholder="Rechercher par email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm font-light bg-[#f5f7f6] border border-black/5 rounded-xl outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#879f98] font-light">
            Chargement…
          </div>
        ) : referrals.length === 0 ? (
          <p className="text-sm text-[#879f98] font-light text-center py-8">Aucun parrainage trouvé.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-light">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light pb-3 pr-4">Parrain</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light pb-3 pr-4">Filleul</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light pb-3 pr-4">Statut</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f5f7f6]/50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-[#132A24]">
                          {r.referrer?.firstname && r.referrer?.lastname
                            ? `${r.referrer.firstname} ${r.referrer.lastname}`
                            : (r.referrer?.username || "—")}
                        </p>
                        <p className="text-[10px] text-[#879f98]">{r.referrer?.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        {r.referred_user ? (
                          <>
                            <p className="text-[#132A24]">
                              {r.referred_user.firstname && r.referred_user.lastname
                                ? `${r.referred_user.firstname} ${r.referred_user.lastname}`
                                : (r.referred_user.username || "—")}
                            </p>
                            <p className="text-[10px] text-[#879f98]">{r.referred_user.email}</p>
                          </>
                        ) : (
                          <p className="text-[#879f98]">{r.referred_email}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {r.validated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-light px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                            <IoCheckmarkCircleOutline /> Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-light px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            <IoTimeOutline /> En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[#879f98] text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        {r.validated_at && (
                          <p className="text-[10px] text-green-600">
                            validé le {new Date(r.validated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                <p className="text-xs text-[#879f98] font-light">
                  Page {pagination.page} / {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-light rounded-lg border border-black/10 text-[#132A24] hover:bg-[#f5f7f6] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 text-xs font-light rounded-lg border border-black/10 text-[#132A24] hover:bg-[#f5f7f6] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

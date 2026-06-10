import { useState, useEffect, useCallback } from "react";
import { getData, postData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoCopyOutline, IoCheckmarkOutline, IoGiftOutline, IoPeopleOutline, IoMailOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
};

export default function ReferralPage() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [email, setEmail]       = useState("");
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied]     = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setStats(await getData("user/referral"));
    } catch { toast.error("Impossible de charger vos parrainages."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleCopy = () => {
    if (!stats?.referral_link) return;
    navigator.clipboard?.writeText(stats.referral_link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setClaiming(true);
      const res = await postData("user/referral/claim", { email: email.trim() });
      toast.success(res.message);
      setEmail("");
      await fetchStats();
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); }
      catch { toast.error("Erreur lors de la validation."); }
    } finally { setClaiming(false); }
  };

  if (loading) return (
    <div className="mt-6 py-20 text-center text-sm text-[#879f98] font-light">Chargement…</div>
  );

  const progress  = stats?.progress ?? 0;   // 0-4
  const pct       = (progress / 5) * 100;

  return (
    <div className="mt-6 space-y-5">
      {/* Header */}
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#eef5f1] flex items-center justify-center shrink-0">
            <IoGiftOutline className="text-[#132A24] text-xl" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Mon espace</p>
            <h1 className="mt-0.5 text-xl font-light text-[#132A24] tracking-tight">Parrainage</h1>
            <p className="mt-1 text-sm text-[#879f98] font-light leading-relaxed">
              Parrainez 5 amis qui s'inscrivent sur Proxilio et gagnez <strong className="text-[#132A24] font-normal">1 mois de Premium offert</strong> — cumulable sans limite.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Colonne gauche — lien + claim */}
        <div className="lg:col-span-2 space-y-5">

          {/* Lien de parrainage */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Votre lien de parrainage</p>
            <p className="text-xs text-[#879f98] font-light leading-relaxed">
              Partagez ce lien : quand quelqu'un s'inscrit via votre lien, son compte est automatiquement lié au vôtre.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-[#f5f7f6] border border-black/5 rounded-xl px-3 py-2.5 text-sm font-light text-[#132A24] truncate select-all">
                {stats?.referral_link}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-[#132A24] hover:bg-[#1b3b33] text-white px-3 py-2.5 text-sm font-light transition active:scale-95"
              >
                {copied ? <IoCheckmarkOutline className="text-green-300" /> : <IoCopyOutline />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>

          {/* Validation manuelle */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Valider un parrainage manuellement</p>
              <p className="text-xs text-[#879f98] font-light leading-relaxed">
                Vous avez référé quelqu'un sans votre lien ? Entrez son adresse email.
                Son compte doit exister depuis au moins 48h et avoir un prénom + nom renseignés.
              </p>
            </div>
            <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.fr"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f5f7f6] border border-black/5 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={claiming || !email.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#132A24] px-5 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-50 sm:shrink-0"
              >
                {claiming ? "Vérification…" : "Valider"}
              </button>
            </form>
          </div>

          {/* Historique */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Historique</p>
              <span className="text-xs text-[#879f98] font-light flex items-center gap-1">
                <IoPeopleOutline /> {stats?.referrals?.length || 0} parrainage{(stats?.referrals?.length || 0) > 1 ? "s" : ""}
              </span>
            </div>

            {!stats?.referrals?.length ? (
              <p className="text-sm text-[#879f98] font-light text-center py-6">Aucun parrainage pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {stats.referrals.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                    r.validated ? "border-[#132A24]/10 bg-[#eef5f1]" : "border-black/5 bg-[#f5f7f6]"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${r.validated ? "bg-[#132A24]" : "bg-[#879f98]/40"}`} />
                      <span className="text-sm font-light text-[#132A24] truncate">{maskEmail(r.email)}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      {r.validated ? (
                        <span className="text-xs text-[#4b8a74] font-light">✓ Validé le {fmtDate(r.validated_at)}</span>
                      ) : (
                        <span className="text-xs text-[#879f98] font-light">En attente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — progression */}
        <div className="space-y-5">

          {/* Compteur progression */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Progression</p>

            {/* Barre */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-light text-[#132A24]">{progress}</span>
                <span className="text-sm text-[#879f98] font-light">/ 5 parrainages</span>
              </div>
              <div className="h-2 rounded-full bg-[#f5f7f6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#132A24] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-[#879f98] font-light mt-1.5">
                {progress === 0 && stats?.total_validated > 0
                  ? "🎉 Palier atteint ! Premium accordé."
                  : `Encore ${5 - progress} parrainage${5 - progress > 1 ? "s" : ""} pour 1 mois gratuit`}
              </p>
            </div>

            {/* Paliers visuels */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`flex-1 h-1 rounded-full transition-all ${n <= progress ? "bg-[#132A24]" : "bg-[#f5f7f6]"}`} />
              ))}
            </div>
          </div>

          {/* Stats globales */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Vos gains</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-[#879f98]">Parrainages validés</span>
                <span className="text-sm font-light text-[#132A24]">{stats?.total_validated ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-[#879f98]">Mois Premium gagnés</span>
                <span className="text-sm font-light text-[#132A24] flex items-center gap-1">
                  <FaStar className="text-amber-400 text-xs" />
                  {stats?.rewards_earned ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Règles */}
          <div className="bg-[#eef5f1] border border-[#132A24]/10 rounded-2xl p-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#132A24] font-light">Comment ça marche</p>
            <ul className="space-y-1.5 text-xs font-light text-[#4b615a] leading-relaxed">
              <li>• Partagez votre lien ou entrez l'email d'un filleul</li>
              <li>• Le compte doit avoir <strong className="font-normal text-[#132A24]">48h d'ancienneté</strong> et un profil complet (prénom + nom)</li>
              <li>• Chaque email ne compte <strong className="font-normal text-[#132A24]">qu'une seule fois</strong> sur toute la plateforme</li>
              <li>• À <strong className="font-normal text-[#132A24]">5 parrainages</strong> validés → 1 mois Premium offert sur votre entreprise</li>
              <li>• C'est <strong className="font-normal text-[#132A24]">cumulable</strong> : 10 parrainages = 2 mois, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

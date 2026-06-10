/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { getData, postData } from "../../../services/data-fetch";
import { toast } from "react-toastify";

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const STATUS_CONFIG = {
  done:      { label: 'Terminées',  color: 'bg-blue-400' },
  accepted:  { label: 'Acceptées',  color: 'bg-[#4b8a74]' },
  pending:   { label: 'En attente', color: 'bg-amber-400' },
  cancelled: { label: 'Annulées',   color: 'bg-black/20' },
  rejected:  { label: 'Refusées',   color: 'bg-red-400' },
};

function computePremiumMetrics(offers) {
  const all = offers.flatMap((o) => o.reservations || []);

  const accepted  = all.filter((r) => r.status === 'accepted').length;
  const rejected  = all.filter((r) => r.status === 'rejected').length;
  const acceptanceRate = (accepted + rejected) > 0
    ? Math.round((accepted / (accepted + rejected)) * 100)
    : null;

  const statusCounts = {
    done:      all.filter((r) => r.status === 'done').length,
    accepted,
    pending:   all.filter((r) => r.status === 'pending').length,
    cancelled: all.filter((r) => r.status === 'cancelled').length,
    rejected,
  };

  const bestOffer = offers.reduce(
    (best, o) => {
      const count = (o.reservations || []).length;
      return count > best.count ? { name: o.name, count } : best;
    },
    { name: null, count: 0 }
  );

  const revenue = offers.reduce((total, o) => {
    const done = (o.reservations || []).filter((r) => r.status === 'done').length;
    return total + (parseFloat(o.price) || 0) * done;
  }, 0);

  const dayCounts = Array(7).fill(0);
  all.forEach((r) => {
    if (r.date) dayCounts[new Date(r.date).getDay()]++;
  });
  const maxIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const bestDay = dayCounts[maxIdx] > 0 ? { name: DAY_NAMES[maxIdx], count: dayCounts[maxIdx] } : null;

  const userCounts = {};
  all.forEach((r) => {
    if (r.User_id) userCounts[r.User_id] = (userCounts[r.User_id] || 0) + 1;
  });
  const totalClients     = Object.keys(userCounts).length;
  const recurringClients = Object.values(userCounts).filter((c) => c > 1).length;

  return { acceptanceRate, statusCounts, bestOffer, revenue, bestDay, recurringClients, totalClients };
}

function StatCard({ title, children }) {
  return (
    <div className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 space-y-2">
      <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">{title}</p>
      {children}
    </div>
  );
}

function CancelModal({ endDate, onConfirm, onClose, loading }) {
  const formatted = endDate
    ? new Date(endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] p-7 w-full max-w-md">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-light text-[#132A24] mb-2">Résilier l'abonnement Premium</h3>
        {formatted ? (
          <p className="text-sm text-[#879f98] font-light leading-relaxed mb-6">
            Le renouvellement automatique sera annulé. Vous conserverez votre accès Premium jusqu'au{" "}
            <span className="text-[#132A24]">{formatted}</span>, puis votre compte repassera en version gratuite.
          </p>
        ) : (
          <p className="text-sm text-[#879f98] font-light leading-relaxed mb-6">
            L'abonnement sera résilié immédiatement et votre accès Premium sera révoqué.
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[#132A24] text-sm font-light hover:bg-[#f5f7f6] transition disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-light transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Traitement…
              </>
            ) : (
              "Confirmer la résiliation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PremiumStats({ enterprise, onPremiumRevoked }) {
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!enterprise?.id || !enterprise?.isPremium) return;
    setLoadingSub(true);
    getData(`stripe/my-subscription/${enterprise.id}`)
      .then((data) => setSubscription(data.subscription))
      .catch(() => setSubscription(null))
      .finally(() => setLoadingSub(false));
  }, [enterprise?.id, enterprise?.isPremium]);

  if (!enterprise?.isPremium) return null;

  const offers = enterprise.offers || [];
  const { acceptanceRate, statusCounts, bestOffer, revenue, bestDay, recurringClients, totalClients } =
    computePremiumMetrics(offers);
  const totalReservations = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const data = await postData("stripe/cancel-subscription", { enterprise_id: enterprise.id });
      setShowModal(false);
      setCancelled(true);
      toast.success(data.message);
      if (!data.cancelAtPeriodEnd && onPremiumRevoked) {
        onPremiumRevoked();
      }
    } catch (err) {
      toast.error("Une erreur est survenue lors de la résiliation.");
    } finally {
      setCancelling(false);
    }
  };

  const TYPE_LABELS = { monthly: "Mensuel", yearly: "Annuel", forever: "À vie" };
  const endDateFormatted = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <FaStar className="w-4 h-4 text-amber-500" />
          <p className="text-base font-light text-[#132A24]">Statistiques Premium</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

          <StatCard title="Taux d'acceptation">
            {acceptanceRate === null ? (
              <p className="text-[#879f98] text-sm font-light">Aucune donnée</p>
            ) : (
              <>
                <p className="text-3xl font-light text-[#132A24]">{acceptanceRate}<span className="text-lg text-[#879f98]">%</span></p>
                <div className="w-full bg-black/5 rounded-full h-1.5 mt-1">
                  <div className="h-1.5 rounded-full bg-[#132A24]" style={{ width: `${acceptanceRate}%` }} />
                </div>
                <p className="text-xs text-[#879f98] font-light">{statusCounts.accepted} acceptées / {statusCounts.rejected} refusées</p>
              </>
            )}
          </StatCard>

          <StatCard title="CA estimé (prestations terminées)">
            <p className="text-3xl font-light text-[#132A24]">
              {revenue.toFixed(0)}<span className="text-lg text-[#879f98]"> €</span>
            </p>
            <p className="text-xs text-[#879f98] font-light">{statusCounts.done} prestation{statusCounts.done !== 1 ? 's' : ''} terminée{statusCounts.done !== 1 ? 's' : ''}</p>
          </StatCard>

          <StatCard title="Service le plus réservé">
            {bestOffer.name ? (
              <>
                <p className="text-[#132A24] font-light truncate">{bestOffer.name}</p>
                <p className="text-xs text-[#879f98] font-light">{bestOffer.count} réservation{bestOffer.count !== 1 ? 's' : ''}</p>
              </>
            ) : (
              <p className="text-[#879f98] text-sm font-light">Aucun service</p>
            )}
          </StatCard>

          <StatCard title="Répartition des réservations">
            {totalReservations === 0 ? (
              <p className="text-[#879f98] text-sm font-light">Aucune réservation</p>
            ) : (
              <div className="space-y-1.5">
                <div className="flex w-full h-2 rounded-full overflow-hidden gap-px">
                  {Object.entries(statusCounts).map(([status, count]) =>
                    count > 0 ? (
                      <div key={status} className={STATUS_CONFIG[status].color} style={{ width: `${(count / totalReservations) * 100}%` }} />
                    ) : null
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {Object.entries(statusCounts).map(([status, count]) =>
                    count > 0 ? (
                      <span key={status} className="flex items-center gap-1 text-xs text-[#879f98] font-light">
                        <span className={`w-2 h-2 rounded-full inline-block ${STATUS_CONFIG[status].color}`} />
                        {STATUS_CONFIG[status].label} ({count})
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </StatCard>

          <StatCard title="Jour le plus actif">
            {bestDay ? (
              <>
                <p className="text-2xl font-light text-[#132A24]">{bestDay.name}</p>
                <p className="text-xs text-[#879f98] font-light">{bestDay.count} réservation{bestDay.count !== 1 ? 's' : ''} ce jour</p>
              </>
            ) : (
              <p className="text-[#879f98] text-sm font-light">Aucune donnée</p>
            )}
          </StatCard>

          <StatCard title="Clients fidèles">
            {totalClients === 0 ? (
              <p className="text-[#879f98] text-sm font-light">Aucun client</p>
            ) : (
              <>
                <p className="text-3xl font-light text-[#132A24]">
                  {recurringClients}
                  <span className="text-lg text-[#879f98]"> / {totalClients}</span>
                </p>
                <p className="text-xs text-[#879f98] font-light">
                  {totalClients > 0
                    ? `${Math.round((recurringClients / totalClients) * 100)}% de clients reviennent`
                    : 'Aucun client'}
                </p>
              </>
            )}
          </StatCard>

        </div>

        {/* ── Gestion abonnement ── */}
        <div className="mt-5 pt-5 border-t border-amber-200/60">
          <p className="text-[10px] uppercase tracking-widest text-amber-600/60 font-light mb-3">Mon abonnement</p>

          {loadingSub ? (
            <div className="text-sm text-[#879f98] font-light">Chargement…</div>
          ) : cancelled ? (
            <div className="flex items-center gap-2.5 text-sm text-[#879f98] font-light">
              <svg className="w-4 h-4 text-[#4b8a74] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {endDateFormatted
                ? `Renouvellement annulé — accès Premium conservé jusqu'au ${endDateFormatted}.`
                : "Abonnement résilié."}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm font-light text-[#132A24]">
                {subscription ? (
                  <>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px]">
                      {TYPE_LABELS[subscription.subscription_type] || subscription.subscription_type}
                    </span>
                    {endDateFormatted && (
                      <span className="text-[#879f98]">
                        Actif jusqu'au <span className="text-[#132A24]">{endDateFormatted}</span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[#879f98]">Abonnement géré manuellement</span>
                )}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-light hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Résilier l'abonnement
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CancelModal
          endDate={subscription?.end_date}
          onConfirm={handleCancel}
          onClose={() => setShowModal(false)}
          loading={cancelling}
        />
      )}
    </>
  );
}

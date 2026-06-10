/* eslint-disable react/prop-types */
import {
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaCalendarCheck,
  FaStar,
  FaEye,
  FaDollarSign,
  FaTimesCircle,
} from "react-icons/fa";
import { useAdminStatsData } from "./useAdminStatsData";
import EnterprisesLast24h from "./EnterprisesLast24h";
import UsersLast24h from "./UsersLast24h";
import SubscriptionsLast24h from "./SubscriptionsLast24h";
import GraphForView from "../../Enterprise/ComponentsForStats/GraphForView";

export default function AdminStats() {
  const data = useAdminStatsData();

  if (!data) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6 text-[#879f98] font-light text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<FaUsers />} title="Utilisateurs" value={safeValue(data.userLength)} subtitle="Comptes totaux" />
        <StatCard icon={<FaBriefcase />} title="Entrepreneurs" value={safeValue(data.entrepreneurLength)} subtitle="Profils entrepreneur" />
        <StatCard icon={<FaBuilding />} title="Entreprises" value={safeValue(data.enterpriseLength)} subtitle="Fiches entreprise" />
        <StatCard icon={<FaCalendarCheck />} title="Réservations" value={safeValue(data.reservationLength)} subtitle="Total réservations" />
        <StatCard icon={<FaStar />} title="Entreprises Premium" value={safeValue(data.premiumEnterpriseLength)} subtitle="Abonnés premium" accent="amber" />
        <StatCard icon={<FaEye />} title="Visites du site" value="N/A" subtitle="Derniers 30 jours" />
        <StatCard icon={<FaDollarSign />} title="Revenus" value="N/A" subtitle="CA cumulé" />
        <StatCard icon={<FaTimesCircle />} title="Non validées" value={safeValue(data.notValidatedEnterprises)} subtitle="En attente de validation" accent="red" />
        <StatCard icon={<FaUsers />} title="Abonnements" value={safeValue(data.subscriptions)} subtitle="Actifs" />
      </div>

      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">Trafic &amp; vues</p>
        <GraphForView />
      </div>

      <div className="flex flex-col gap-4">
        <CardShell title="Entreprises créées (24h)"><EnterprisesLast24h /></CardShell>
        <CardShell title="Utilisateurs inscrits (24h)"><UsersLast24h /></CardShell>
        <CardShell title="Abonnements (24h)"><SubscriptionsLast24h /></CardShell>
      </div>
    </div>
  );
}

function safeValue(v) {
  if (v === null || v === undefined) return "—";
  return typeof v === "number" ? v.toLocaleString() : v;
}

function StatCard({ icon, title, value, subtitle, accent }) {
  const iconCls = accent === "amber"
    ? "bg-amber-50 text-amber-500"
    : accent === "red"
    ? "bg-red-50 text-red-400"
    : "bg-[#eef5f1] text-[#4b8a74]";

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 h-32 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl grid place-items-center flex-shrink-0 text-xl ${iconCls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">{title}</div>
        <div className="mt-1 text-2xl font-light text-[#132A24]">{value}</div>
        {subtitle && <div className="text-[11px] text-[#879f98] font-light mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}

function CardShell({ title, children }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">{title}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

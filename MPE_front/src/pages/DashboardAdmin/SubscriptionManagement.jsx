import { useState } from "react";
import { FaStar, FaCreditCard } from "react-icons/fa";
import EnterprisePremium from "../../components/DashboardAdmin/SubscriptionManagement/EnterprisePremium";
import SubscriptionView from "../../components/DashboardAdmin/SubscriptionManagement/SubscriptionView";

const TABS = [
  { key: "premium", label: "Entreprises Premium", icon: FaStar },
  { key: "subscriptions", label: "Abonnements", icon: FaCreditCard },
];

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState("premium");

  return (
    <div className="space-y-5 mt-6 pb-8">
      {/* Header */}
      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
        <h1 className="text-xl font-light text-[#132A24] tracking-tight">Gestion des abonnements</h1>
        <p className="mt-1 text-sm text-[#879f98] font-light">
          Consultez et gérez les entreprises premium et leurs abonnements actifs.
        </p>
      </div>

      {/* Tabs + contenu */}
      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Onglets */}
        <div className="flex border-b border-black/5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-light transition border-b-2 -mb-px ${
                activeTab === key
                  ? "border-[#132A24] text-[#132A24]"
                  : "border-transparent text-[#879f98] hover:text-[#4b615a] hover:bg-[#f5f7f6]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="p-5 lg:p-6">
          {activeTab === "premium" && <EnterprisePremium />}
          {activeTab === "subscriptions" && <SubscriptionView />}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;

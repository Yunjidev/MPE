import { useEffect, useState } from "react";
import { getData } from "../../../services/data-fetch";
import { filterSubscriptionsLast24h } from "./filterLast24h";

const thCls = "px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light";
const tdCls = "px-4 py-3 text-sm font-light text-[#4b615a] whitespace-nowrap";

const SubscriptionsLast24h = () => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await getData("admin/subscriptions");
        setSubscriptionsData(filterSubscriptionsLast24h(data));
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnements:", error);
      }
    };
    fetchSubscriptions();
  }, []);

  if (subscriptionsData.length === 0) {
    return (
      <p className="text-sm text-[#879f98] font-light py-4">Aucun abonnement ces dernières 24h.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-black/5">
            <th className={thCls}>Nom Entreprise</th>
            <th className={thCls}>Statut</th>
            <th className={thCls}>Type</th>
            <th className={thCls}>Date de début</th>
          </tr>
        </thead>
        <tbody>
          {subscriptionsData.map((subscription, index) => (
            <tr key={index} className="border-b border-black/5 hover:bg-[#f5f7f6] transition">
              <td className={tdCls}>{subscription.enterprise.name}</td>
              <td className={tdCls}>{subscription.status}</td>
              <td className={tdCls}>{subscription.subscription_type}</td>
              <td className={tdCls}>{new Date(subscription.start_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionsLast24h;

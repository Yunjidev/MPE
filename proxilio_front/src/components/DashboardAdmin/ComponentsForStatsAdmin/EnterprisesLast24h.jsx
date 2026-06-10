import { useEffect, useState } from "react";
import { getData } from "../../../services/data-fetch";
import { filterEnterprisesLast24h } from "./filterLast24h";

const thCls = "px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light";
const tdCls = "px-4 py-3 text-sm font-light text-[#4b615a] whitespace-nowrap";

export default function EnterprisesLast24h() {
  const [enterprisesData, setEnterprisesData] = useState([]);

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const data = await getData("admin/enterprises");
        setEnterprisesData(filterEnterprisesLast24h(data));
      } catch (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
      }
    };
    fetchEnterprises();
  }, []);

  if (enterprisesData.length === 0) {
    return (
      <p className="text-sm text-[#879f98] font-light py-4">Aucune entreprise créée ces dernières 24h.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-black/5">
            <th className={thCls}>Nom</th>
            <th className={thCls}>Ville</th>
            <th className={thCls}>Site web</th>
            <th className={thCls}>Logo</th>
            <th className={thCls}>Métier</th>
            <th className={thCls}>Région</th>
          </tr>
        </thead>
        <tbody>
          {enterprisesData.map((enterprise, index) => (
            <tr key={index} className="border-b border-black/5 hover:bg-[#f5f7f6] transition">
              <td className={tdCls}>{enterprise.name}</td>
              <td className={tdCls}>{enterprise.city}</td>
              <td className={tdCls}>{enterprise.website}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <img src={enterprise.logo} alt="logo" className="w-8 h-8 rounded-full border border-black/5 object-cover" />
              </td>
              <td className={tdCls}>{enterprise.job ? enterprise.job.name : "N/A"}</td>
              <td className={tdCls}>{enterprise.country ? enterprise.country.name : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

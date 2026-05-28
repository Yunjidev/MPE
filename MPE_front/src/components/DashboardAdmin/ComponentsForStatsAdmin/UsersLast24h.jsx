import { useEffect, useState } from "react";
import { getData } from "../../../services/data-fetch";
import { filterUsersLast24h } from "./filterLast24h";

const thCls = "px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#879f98] font-light";
const tdCls = "px-4 py-3 text-sm font-light text-[#4b615a] whitespace-nowrap";

const UsersLast24h = () => {
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getData("admin/users");
        setUsersData(filterUsersLast24h(data));
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };
    fetchUsers();
  }, []);

  if (usersData.length === 0) {
    return (
      <p className="text-sm text-[#879f98] font-light py-4">Aucun utilisateur inscrit ces dernières 24h.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-black/5">
            <th className={thCls}>Pseudo</th>
            <th className={thCls}>Email</th>
            <th className={thCls}>Prénom</th>
            <th className={thCls}>Nom</th>
            <th className={thCls}>Entrepreneur</th>
            <th className={thCls}>Avatar</th>
            <th className={thCls}>Entreprises</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user, index) => (
            <tr key={index} className="border-b border-black/5 hover:bg-[#f5f7f6] transition">
              <td className={tdCls}>{user.username}</td>
              <td className={tdCls}>{user.email}</td>
              <td className={tdCls}>{user.firstname}</td>
              <td className={tdCls}>{user.lastname}</td>
              <td className={tdCls}>{user.isentrepreneur ? "Oui" : "Non"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-black/5 object-cover" />
              </td>
              <td className={tdCls}>
                {user.enterprises.map((enterprise, idx) => (
                  <div key={idx}>{enterprise.name}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersLast24h;

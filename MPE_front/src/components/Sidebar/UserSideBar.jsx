import PropTypes from "prop-types";
import NavLink from "../Utils/Link";
import Dropdown from "./Dropdown";
import { FaTachometerAlt, FaBuilding, FaCog, FaUnlockAlt, FaTrashAlt, FaEnvelope } from "react-icons/fa";

export default function UserSideBar({ user, iconstyle, linkstyle, onClick }) {
  const navItems = [
    { to: "/dashboard/user-db", icon: <FaTachometerAlt className={iconstyle} />, label: "Mon profil" },
    { to: "/dashboard/user-messages", icon: <FaEnvelope className={iconstyle} />, label: "Mes messages" },
    { to: "/dashboard/register-company", icon: <FaBuilding className={iconstyle} />, label: "Création Entreprise" },
    {
      type: "dropdown",
      icon: <FaCog className={iconstyle} />,
      label: "Sécurité Compte",
      dropdownItems: [
        { to: "/dashboard/update-password", icon: <FaUnlockAlt className={iconstyle} />, label: "Mot de passe" },
        { to: "/dashboard/deleteAccount", icon: <FaTrashAlt className={iconstyle} />, label: "Supprimer le compte" },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center px-3 py-2.5 gap-3">
        <img
          src={user?.avatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-black/5"
        />
        <div className="min-w-0">
          <p className="text-sm font-light text-[#132A24] truncate">{user ? user.username : "Guest"}</p>
          {user?.email && <p className="text-[11px] text-[#879f98] truncate">{user.email}</p>}
        </div>
      </div>

      <div className="mx-3 border-t border-black/5 my-1" />

      <ul className="space-y-0.5">
        {navItems.map((item, i) =>
          item.type === "dropdown" ? (
            <Dropdown key={i} {...item} iconStyle={iconstyle} linkstyle={linkstyle} onClick={onClick} />
          ) : (
            <NavLink key={i} {...item} linkstyle={linkstyle} onClick={onClick} />
          )
        )}
      </ul>

      <div className="mx-3 border-t border-black/5 my-1" />
    </div>
  );
}

UserSideBar.propTypes = {
  user: PropTypes.object,
  iconstyle: PropTypes.string,
  linkstyle: PropTypes.string,
  onClick: PropTypes.func,
};

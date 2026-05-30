import PropTypes from "prop-types";
import NavLink from "../Utils/Link";
import { FaTachometerAlt, FaBuilding, FaUsers, FaPenFancy, FaEuroSign, FaEnvelope, FaBullhorn } from "react-icons/fa";

export default function AdminSideBar({ user, iconstyle, linkstyle, onClick }) {
  if (!user?.isAdmin) return null;

  const navItems = [
    { to: "/dashboard/admin-db", icon: <FaTachometerAlt className={iconstyle} />, label: "Tableau de Bord" },
    { to: "/dashboard/accept-company", icon: <FaBuilding className={iconstyle} />, label: "Validation Entreprises" },
    { to: "/dashboard/manage-users", icon: <FaUsers className={iconstyle} />, label: "Liste des utilisateurs" },
    { to: "/dashboard/manage-companies", icon: <FaBuilding className={iconstyle} />, label: "Liste des entreprises validées" },
    { to: "/dashboard/jobsandcountrycreate", icon: <FaPenFancy className={iconstyle} />, label: "Gestion des métiers" },
    { to: "/dashboard/subscriptionmanagement", icon: <FaEuroSign className={iconstyle} />, label: "Gestion des abonnements" },
    { to: "/dashboard/marketing", icon: <FaEnvelope className={iconstyle} />, label: "Marketing — Emails" },
    { to: "/dashboard/banner", icon: <FaBullhorn className={iconstyle} />, label: "Bandeau défilant" },
  ];

  return (
    <ul className="space-y-0.5">
      {navItems.map((item, i) => (
        <li key={i}>
          <NavLink {...item} linkstyle={linkstyle} onClick={onClick} />
        </li>
      ))}
    </ul>
  );
}

AdminSideBar.propTypes = {
  user: PropTypes.object,
  iconstyle: PropTypes.string,
  linkstyle: PropTypes.string,
  onClick: PropTypes.func,
};

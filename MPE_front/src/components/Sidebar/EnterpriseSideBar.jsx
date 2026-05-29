import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { FaBuilding, FaCalendarAlt, FaBook, FaConciergeBell, FaFileInvoiceDollar, FaReceipt, FaEnvelope } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useAtom } from "jotai";
import { enterprisesAtom } from "../../store/enterprises";

const Badge = ({ count }) => count > 0 ? (
  <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#132A24] text-white text-[9px] font-medium">{count > 99 ? "99+" : count}</span>
) : null;

export default function EnterpriseSideBar({ iconStyle, linkstyle, unreadCounts = {}, onClick }) {
  const [enterprises] = useAtom(enterprisesAtom);

  return (
    <ul className="space-y-0.5">
      {(enterprises || []).map((enterprise) => (
        <li key={enterprise.id}>
          <Dropdown
            dropdownItems={[
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/dashboard`, icon: <MdDashboard className={iconStyle} />, label: "Tableau de Bord" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/planning`, icon: <FaCalendarAlt className={iconStyle} />, label: "Planning" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/reservations`, icon: <FaBook className={iconStyle} />, label: "Réservations" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/offers`, icon: <FaConciergeBell className={iconStyle} />, label: "Mes services" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/devis`, icon: <FaFileInvoiceDollar className={iconStyle} />, label: "Devis" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/factures`, icon: <FaReceipt className={iconStyle} />, label: "Factures" },
              { to: `/dashboard/enterprise/${enterprise.slug || enterprise.id}/messages`, icon: <FaEnvelope className={iconStyle} />, label: <span className="flex-1 flex items-center justify-between"><span>Messagerie</span><Badge count={unreadCounts[enterprise.slug || enterprise.id] || 0} /></span> },
            ]}
            label={enterprise.name}
            icon={
              enterprise.logo ? (
                <img src={enterprise.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <FaBuilding className={iconStyle} />
              )
            }
            linkstyle={linkstyle}
            option={
              !enterprise.isValidate ? (
                <span className="text-[10px] font-light px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                  En validation
                </span>
              ) : null
            }
            isDisabled={!enterprise.isValidate}
            onClick={onClick}
          />
        </li>
      ))}
    </ul>
  );
}

EnterpriseSideBar.propTypes = {
  iconStyle: PropTypes.string,
  linkstyle: PropTypes.string,
  onClick: PropTypes.func,
};

import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function NavLink({ to, icon, label, onClick, linkstyle }) {
  return (
    <Link
      to={to}
      className={`flex items-center rounded-md ${linkstyle}`}
      onClick={onClick}
    >
      {icon}
      <span className="font-light text-[#132A24]">{label}</span>
    </Link>
  );
}

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  onClick: PropTypes.func,
  linkstyle: PropTypes.string,
};

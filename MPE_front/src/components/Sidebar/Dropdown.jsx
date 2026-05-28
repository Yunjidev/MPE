import PropTypes from "prop-types";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import NavLink from "../Utils/Link";

export default function Dropdown({
  dropdownItems,
  label,
  icon,
  iconStyle = "",
  linkstyle = "",
  option = null,
  isDisabled = false,
  onClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => !isDisabled && setIsOpen((s) => !s);

  return (
    <div className={`rounded-lg ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <button
        className={`flex items-center justify-between w-full ${linkstyle}`}
        onClick={toggleDropdown}
        disabled={isDisabled}
        type="button"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0">{icon}</span>
          <span className="font-light truncate text-[#132A24]">{label}</span>
          {option && <span className="shrink-0">{option}</span>}
        </div>
        <div className="shrink-0 text-[#879f98]">
          {!isOpen ? <FaChevronDown className="w-3 h-3" /> : <FaChevronUp className="w-3 h-3" />}
        </div>
      </button>

      {isOpen && !isDisabled && (
        <ul className="pl-3 mt-0.5 space-y-0.5">
          {dropdownItems.map((item, index) => (
            <NavLink key={index} {...item} linkstyle={linkstyle} onClick={onClick} />
          ))}
        </ul>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  dropdownItems: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  iconStyle: PropTypes.string,
  linkstyle: PropTypes.string,
  option: PropTypes.element,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

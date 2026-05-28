import PropTypes from "prop-types";

export default function InputText({
  id,
  value = "",
  onChange,
  placeholder,
  className="",
  inputStyle="",
  icon,
  type = "text",
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {icon && <span className="absolute left-3 text-[#879f98]">{icon}</span>}
      <input
        type={type}
        id={id}
        value={value !== null ? value : ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputStyle} block ps-9 h-11 border border-black/5 w-full bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] rounded-xl text-start focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 focus:border-[#132A24]/30 transition-colors`}
      />
    </div>
  );
}
InputText.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  className: PropTypes.string,
  icon: PropTypes.element.isRequired,
  type: PropTypes.string,
  inputStyle: PropTypes.string,
};

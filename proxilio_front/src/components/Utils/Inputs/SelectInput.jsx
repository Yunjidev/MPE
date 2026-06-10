import PropTypes from "prop-types";

export default function InputSelect({
  id,
  label,
  value = "",
  onChange,
  placeholder,
  className,
  icon,
  options,
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {icon && <span className="absolute left-3 text-[#879f98] pointer-events-none">{icon}</span>}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full ps-9 h-11 border border-black/5 bg-[#f5f7f6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 focus:border-[#132A24]/30 transition-colors appearance-none ${value ? "text-[#132A24]" : "text-[#879f98]"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-[#132A24]">
            {option.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[#879f98]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </div>
  );
}
InputSelect.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  className: PropTypes.string,
  icon: PropTypes.element.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

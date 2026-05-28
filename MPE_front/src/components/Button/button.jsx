import PropTypes from "prop-types";

export default function Button({ type = "button", onClick, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full mt-5 h-12 rounded-xl font-light tracking-tight
                 bg-[#132A24] text-white
                 hover:bg-[#1b3b33]
                 active:scale-[0.98]
                 transition-all duration-200 ease-in-out"
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

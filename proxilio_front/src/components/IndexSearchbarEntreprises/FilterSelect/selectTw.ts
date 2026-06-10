// Tailwind-only styles for react-select (use with `unstyled` + `classNames`)
export const selectClassNames = {
  control: ({ isFocused }) =>
    [
      "min-h-10 rounded-xl border transition-all duration-150",
      "bg-[#f5f7f6] text-[#132A24]",
      isFocused
        ? "border-[#132A24]/30 ring-1 ring-[#132A24]/20"
        : "border-black/5 hover:border-[#132A24]/20",
    ].join(" "),
  valueContainer: () => "px-2 gap-1",
  multiValue: () =>
    "bg-[#eef5f1] border border-[#132A24]/10 rounded-lg flex items-center",
  multiValueLabel: () => "text-[#132A24] px-2 py-0.5 text-sm font-light",
  multiValueRemove: () =>
    "hover:bg-[#132A24]/10 hover:text-[#132A24] rounded-lg ml-1 px-1",
  input: () => "text-[#132A24]",
  placeholder: () => "text-[#879f98]",
  indicatorsContainer: () => "text-[#879f98]",
  dropdownIndicator: ({ isFocused }) =>
    (isFocused ? "text-[#132A24]" : "text-[#879f98]") + " px-2",
  clearIndicator: () => "text-[#879f98] hover:text-[#132A24] px-2",
  menu: () =>
    "mt-2 bg-white border border-black/5 rounded-xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]",
  menuList: () => "max-h-60 overflow-auto",
  option: ({ isFocused, isSelected }) =>
    [
      "px-3 py-2 cursor-pointer text-sm font-light",
      isSelected
        ? "bg-[#eef5f1] text-[#132A24]"
        : isFocused
        ? "bg-[#f5f7f6] text-[#132A24]"
        : "text-[#4b615a]",
    ].join(" "),
  noOptionsMessage: () => "px-3 py-2 text-[#879f98] text-sm font-light",
};

/* eslint-disable react/prop-types */
export default function PremiumCheckbox({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-black/10 text-[#132A24] focus:ring-[#132A24]/20 bg-[#f5f7f6] accent-[#132A24]"
      />
      <span className="text-[#132A24] text-sm font-light">Premium uniquement</span>
    </label>
  );
}

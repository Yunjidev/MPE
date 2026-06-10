/* eslint-disable react/prop-types */
const thresholds = [1, 2, 3, 4, 5];

const RatingSelect = ({ minRating, setMinRating }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    setMinRating(value === "all" ? null : Number(value));
  };

  return (
    <select
      value={minRating ?? "all"}
      onChange={handleChange}
      className="w-full rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2.5 text-sm text-[#132A24] font-light focus:border-[#132A24]/30 focus:ring-1 focus:ring-[#132A24]/20 focus:outline-none"
    >
      <option value="all">Toutes les notes</option>
      {thresholds.map((threshold) => (
        <option key={threshold} value={threshold}>
          ≥ {threshold} ★
        </option>
      ))}
    </select>
  );
};

export default RatingSelect;

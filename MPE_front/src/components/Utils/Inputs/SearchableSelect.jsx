import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

export default function SearchableSelect({ id, value, onChange, options, placeholder, icon, className = "" }) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const containerRef          = useRef(null);

  /* Libellé de la valeur actuellement sélectionnée */
  const selectedLabel = options.find((o) => String(o.id) === String(value))?.name || "";

  /* Filtrage */
  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  /* Fermer si clic en dehors */
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { id, value: String(opt.id) } });
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { id, value: "" } });
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 w-full h-11 border rounded-xl bg-[#f5f7f6] px-3 cursor-pointer transition-colors ${
          open ? "border-[#132A24]/30 ring-2 ring-[#132A24]/10" : "border-black/5"
        }`}
      >
        {icon && <span className="text-[#879f98] shrink-0">{icon}</span>}
        <span className={`flex-1 text-sm font-light truncate ${selectedLabel ? "text-[#132A24]" : "text-[#879f98]"}`}>
          {selectedLabel || placeholder}
        </span>
        {value && (
          <button onClick={handleClear} className="shrink-0 text-[#879f98] hover:text-red-400 transition text-base leading-none">×</button>
        )}
        <span className={`shrink-0 text-[#879f98] transition-transform ${open ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-black/5 rounded-xl shadow-lg overflow-hidden">
          {/* Champ de recherche */}
          <div className="p-2 border-b border-black/5">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un métier…"
              className="w-full rounded-lg bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* Liste filtrée */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#879f98] font-light text-center">Aucun résultat</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2.5 text-sm font-light cursor-pointer transition-colors ${
                    String(opt.id) === String(value)
                      ? "bg-[#eef5f1] text-[#132A24] font-medium"
                      : "text-[#132A24] hover:bg-[#f5f7f6]"
                  }`}
                >
                  {opt.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

SearchableSelect.propTypes = {
  id:          PropTypes.string.isRequired,
  value:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange:    PropTypes.func.isRequired,
  options:     PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string })).isRequired,
  placeholder: PropTypes.string.isRequired,
  icon:        PropTypes.element,
  className:   PropTypes.string,
};

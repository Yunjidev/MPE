/* eslint-disable react/prop-types */
import AsyncSelect from "react-select/async";
import { selectClassNames } from "./selectTw";

const fetchCitiesByName = async (q) => {
  if (!q || q.trim().length < 1) return [];
  const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q.trim())}&fields=nom,codesPostaux,code,codeRegion&boost=population&limit=15`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  const out = [];
  for (const c of data || []) {
    const name = (c.nom || "").trim();
    if (!name) continue;
    const k = name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ label: name, value: name });
  }
  return out;
};

export default function CitySelect({ selectedCities, setSelectedCities }) {
  const loadOptions = async (inputValue) => {
    try {
      return await fetchCitiesByName(inputValue);
    } catch {
      return [];
    }
  };

  return (
    <AsyncSelect
      isMulti
      defaultOptions={false}
      loadOptions={loadOptions}
      placeholder="Tapez une ville…"
      value={selectedCities}
      onChange={(vals) => setSelectedCities(vals || [])}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? "Aucune ville trouvée" : "Tapez pour chercher"
      }
      loadingMessage={() => "Recherche…"}
      classNames={selectClassNames}
      unstyled
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
    />
  );
}

/* eslint-disable react/prop-types */
import { useState } from "react";
import { getData } from "../../services/data-fetch";

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=fr`;
  const res = await fetch(url, { headers: { "User-Agent": "Proxilio-App/1.0" } });
  const data = await res.json();
  if (data.length === 0) throw new Error("Adresse introuvable");
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name.split(",")[0] };
}

export default function LocationFilter({ onGeoResults, onClear, active }) {
  const [radius, setRadius] = useState(20);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resultInfo, setResultInfo] = useState(null);
  const [addressInput, setAddressInput] = useState("");

  const handleSearch = async () => {
    if (!addressInput.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    setResultInfo(null);
    try {
      const { lat, lng, display } = await geocodeAddress(addressInput.trim());
      const data = await getData(`enterprises/nearby?lat=${lat}&lng=${lng}&dist=${radius}`);
      if (!Array.isArray(data)) throw new Error();
      setResultInfo({ label: display, count: data.length });
      onGeoResults(data, radius);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.message === "Adresse introuvable"
          ? "Adresse introuvable. Essayez une ville ou un code postal."
          : "Erreur lors de la recherche. Réessayez."
      );
    }
  };

  const handleClear = () => {
    setStatus("idle");
    setErrorMsg("");
    setResultInfo(null);
    setAddressInput("");
    onClear();
  };

  return (
    <div className="space-y-3">
      {/* Radius pills */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Rayon de recherche</p>
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-full text-xs font-light transition-all duration-200 border ${
                radius === r
                  ? "bg-[#132A24] text-white border-[#132A24]"
                  : "bg-[#f5f7f6] border-black/5 text-[#4b615a] hover:border-[#132A24]/20 hover:text-[#132A24]"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Address input */}
      <div className="flex gap-2 w-full min-w-0">
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && status !== "loading" && handleSearch()}
          placeholder="Ville, code postal…"
          className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-[#f5f7f6] border border-black/5 text-[#132A24] text-sm placeholder:text-[#879f98] font-light focus:outline-none focus:ring-1 focus:ring-[#132A24]/20 focus:border-[#132A24]/30"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={status === "loading" || !addressInput.trim()}
          className="shrink-0 px-3 py-2.5 rounded-xl bg-[#132A24] text-white hover:bg-[#1b3b33] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          {status === "loading" ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Clear button */}
      {active && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full py-2 rounded-xl border border-black/5 bg-[#f5f7f6] text-[#4b615a] hover:text-[#132A24] hover:border-[#132A24]/20 text-xs font-light transition-all duration-200"
        >
          Désactiver le filtre géographique
        </button>
      )}

      {/* Feedback */}
      {status === "done" && resultInfo && (
        <div className="flex items-center gap-2 text-xs text-[#132A24] bg-[#eef5f1] rounded-xl px-3 py-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="font-light">{resultInfo.count} professionnel{resultInfo.count !== 1 ? "s" : ""} autour de {resultInfo.label}</span>
        </div>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500 font-light">{errorMsg}</p>
      )}
    </div>
  );
}

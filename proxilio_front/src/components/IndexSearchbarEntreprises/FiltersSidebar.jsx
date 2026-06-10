/* eslint-disable react/prop-types */
import { useState } from "react";
import JobSelect from "./FilterSelect/Jobselect";
import CountrySelect from "./FilterSelect/Countryselect";
import CitySelect from "./FilterSelect/CitySelect";
import RatingSelect from "./FilterSelect/RatingSelect";
import PremiumCheckbox from "./FilterSelect/PremiumCheckbox";
import LocationFilter from "./LocationFilter";

function Section({ title, open, onToggle, children, badge }) {
  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#879f98] font-light">{title}</span>
          {badge}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#879f98] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "pb-4" : "max-h-0"}`}>
        {open && children}
      </div>
    </div>
  );
}

export default function FiltersSidebar({
  selectedJobs, setSelectedJobs,
  selectedCountries, setSelectedCountries,
  selectedCities, setSelectedCities,
  minRating, setMinRating,
  onlyPremium, setOnlyPremium,
  performSearch, resetAll,
  onGeoResults, onGeoClear, geoActive,
}) {
  const [open, setOpen] = useState({
    geo: true, job: true, region: false, city: false, rating: false, prime: false,
  });

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  return (
    <aside className="w-full bg-white border border-black/5 rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-black/5">
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Filtres</p>
        <p className="text-sm text-[#132A24] font-light tracking-tight">Affiner la recherche</p>
      </div>

      {/* Sections */}
      <div className="px-5">
        <Section
          title="Autour de moi"
          open={open.geo}
          onToggle={() => toggle("geo")}
          badge={
            geoActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10 font-light">
                Actif
              </span>
            )
          }
        >
          <LocationFilter onGeoResults={onGeoResults} onClear={onGeoClear} active={geoActive} />
        </Section>

        <Section title="Métiers" open={open.job} onToggle={() => toggle("job")}>
          <JobSelect selectedJobs={selectedJobs} setSelectedJobs={setSelectedJobs} />
        </Section>

        <Section title="Régions" open={open.region} onToggle={() => toggle("region")}>
          <CountrySelect selectedCountries={selectedCountries} setSelectedCountries={setSelectedCountries} />
        </Section>

        <Section title="Villes" open={open.city} onToggle={() => toggle("city")}>
          <CitySelect selectedCities={selectedCities} setSelectedCities={setSelectedCities} />
        </Section>

        <Section title="Note minimale" open={open.rating} onToggle={() => toggle("rating")}>
          <RatingSelect minRating={minRating} setMinRating={setMinRating} />
        </Section>

        <Section title="Abonnement" open={open.prime} onToggle={() => toggle("prime")}>
          <PremiumCheckbox value={onlyPremium} onChange={setOnlyPremium} />
        </Section>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-black/5 flex gap-3">
        <button
          onClick={resetAll}
          className="flex-1 h-10 rounded-full border border-black/10 text-[#132A24] text-sm font-light hover:bg-[#f5f7f6] transition-colors"
        >
          Réinitialiser
        </button>
        <button
          onClick={performSearch}
          className="flex-1 h-10 rounded-full bg-[#132A24] text-white text-sm font-light hover:bg-[#1b3b33] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          Rechercher
        </button>
      </div>
    </aside>
  );
}

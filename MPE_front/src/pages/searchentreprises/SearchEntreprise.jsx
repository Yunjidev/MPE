import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { getData } from "../../services/data-fetch";
import IndexCardsEntreprises from "../../components/CardsEntreprises/IndexCardsEntreprises";
import FiltersSidebar from "../../components/IndexSearchbarEntreprises/FiltersSidebar";

const SearchEntreprise = () => {
  const [entreprises, setEntreprises] = useState([]);
  const [allEnterprises, setAllEnterprises] = useState([]);
  const [user] = useAtom(userAtom);
  const userId = user.id;
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [minRating, setMinRating] = useState(null);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [geoResults, setGeoResults] = useState(null);
  const [geoActive, setGeoActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const sortEnterprises = useCallback((list) => {
    return [...list].sort((a, b) => {
      const premiumA = a?.isPremium ? 1 : 0;
      const premiumB = b?.isPremium ? 1 : 0;
      if (premiumA !== premiumB) return premiumB - premiumA;
      const ratingA = typeof a?.averageRating === "number" ? a.averageRating : 0;
      const ratingB = typeof b?.averageRating === "number" ? b.averageRating : 0;
      return ratingB - ratingA;
    });
  }, []);

  const fetchEntreprises = useCallback(async () => {
    try {
      const response = await getData("enterprises/validate");
      const normalized = Array.isArray(response)
        ? response.map((e) => ({ ...e, isPremium: Boolean(e.isPremium), hasActiveSubscription: Boolean(e.hasActiveSubscription) }))
        : [];
      setAllEnterprises(normalized);
      setEntreprises(sortEnterprises(normalized));
    } catch (error) {
      console.error("Error fetching entreprises:", error);
    }
  }, [sortEnterprises]);

  useEffect(() => { fetchEntreprises(); }, [fetchEntreprises]);

  const handleGeoResults = (results) => { setGeoResults(results); setGeoActive(true); setEntreprises(sortEnterprises(results)); };
  const handleGeoClear = () => { setGeoResults(null); setGeoActive(false); setEntreprises(sortEnterprises(allEnterprises)); };

  const applyFilters = useCallback(() => {
    const base = geoResults ?? allEnterprises;
    const filtered = base.filter((e) => {
      const jobMatch = selectedJobs.length === 0 || selectedJobs.some((j) => e.job && e.job.name === j.label);
      const countryMatch = selectedCountries.length === 0 || selectedCountries.some((r) => e.country && e.country.name === r.label);
      const cityMatch = selectedCities.length === 0 || selectedCities.some((c) => e.city === c.label);
      const ratingMatch = minRating === null || (typeof e.averageRating === "number" && e.averageRating >= minRating);
      const premiumMatch = !onlyPremium || Boolean(e.isPremium);
      const term = searchTerm.trim().toLowerCase();
      const searchMatch = term.length === 0 || [e.name, e.description, e.city, e.job?.name].filter(Boolean).some((f) => f.toString().toLowerCase().includes(term));
      return jobMatch && countryMatch && cityMatch && ratingMatch && premiumMatch && searchMatch;
    });
    setEntreprises(sortEnterprises(filtered));
    setCurrentPage(1);
  }, [allEnterprises, geoResults, selectedJobs, selectedCountries, selectedCities, minRating, onlyPremium, searchTerm, sortEnterprises]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("query") || "");
  }, [location.search]);

  const resetAll = useCallback(() => {
    setSelectedJobs([]); setSelectedCountries([]); setSelectedCities([]);
    setMinRating(null); setOnlyPremium(false); setSearchTerm("");
    navigate("/searchentreprise", { replace: true });
    setEntreprises(sortEnterprises(allEnterprises));
  }, [allEnterprises, navigate, sortEnterprises]);

  const activeFilterCount = selectedJobs.length + selectedCountries.length + selectedCities.length + (minRating ? 1 : 0) + (onlyPremium ? 1 : 0);
  const totalPages = Math.ceil(entreprises.length / PAGE_SIZE);
  const paginatedEntreprises = entreprises.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
    <Helmet>
      <title>Trouver un professionnel local vérifié | Proxilio</title>
      <meta name="description" content="Recherchez parmi des centaines de professionnels locaux vérifiés : plombiers, électriciens, artisans et plus. Filtrez par métier, région et note. Réservez en ligne." />
      <link rel="canonical" href="https://www.proxilio.fr/searchentreprise" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.proxilio.fr/searchentreprise" />
      <meta property="og:title" content="Trouver un professionnel local vérifié | Proxilio" />
      <meta property="og:description" content="Recherchez parmi des centaines de professionnels locaux vérifiés : plombiers, électriciens, artisans et plus." />
      <meta property="og:image" content="https://www.proxilio.fr/assets/img/og-default.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Proxilioapp" />
    </Helmet>
    <div className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-10 sm:py-14 w-full">

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-3 flex items-center gap-2">
          <span className="w-6 h-px bg-[#879f98]" /> RECHERCHE
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="font-light text-3xl sm:text-4xl text-[#132A24] tracking-tight">
            Trouvez un professionnel<br className="hidden sm:block" />
            <span className="text-[#274F44]"> près de chez vous.</span>
          </h1>
          <p className="text-sm text-[#879f98] font-light tracking-tight shrink-0">
            {entreprises.length} résultat{entreprises.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Geo banner */}
      {geoActive && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-2xl bg-[#eef5f1] border border-[#132A24]/10 text-[#132A24] text-sm font-light">
          <svg className="w-4 h-4 shrink-0 text-[#274F44]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {entreprises.length} professionnel{entreprises.length !== 1 ? "s" : ""} trouvé{entreprises.length !== 1 ? "s" : ""} autour de vous
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-12 gap-8 xl:gap-12 items-start">

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <FiltersSidebar
              selectedJobs={selectedJobs} setSelectedJobs={setSelectedJobs}
              selectedCountries={selectedCountries} setSelectedCountries={setSelectedCountries}
              selectedCities={selectedCities} setSelectedCities={setSelectedCities}
              minRating={minRating} setMinRating={setMinRating}
              onlyPremium={onlyPremium} setOnlyPremium={setOnlyPremium}
              performSearch={applyFilters}
              resetAll={resetAll}
              onGeoResults={handleGeoResults}
              onGeoClear={handleGeoClear}
              geoActive={geoActive}
            />
          </div>
        </aside>

        {/* Results */}
        <main className="col-span-12 lg:col-span-9">
          {entreprises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#eef5f1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#879f98]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                </svg>
              </div>
              <p className="text-[#132A24] font-light tracking-tight">Aucun résultat pour ces filtres.</p>
              {activeFilterCount > 0 && (
                <button onClick={resetAll} className="text-sm text-[#879f98] hover:text-[#132A24] transition-colors font-light underline underline-offset-4">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {paginatedEntreprises.map((entreprise) => (
                  <IndexCardsEntreprises key={entreprise.id} entreprise={entreprise} userId={userId} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-sm font-light border border-black/10 text-[#132A24] hover:bg-[#eef5f1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "…" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-[#879f98] text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 rounded-xl text-sm font-light transition-colors ${
                            p === currentPage
                              ? "bg-[#132A24] text-white"
                              : "border border-black/10 text-[#132A24] hover:bg-[#eef5f1]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-light border border-black/10 text-[#132A24] hover:bg-[#eef5f1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
    </>
  );
};

export default SearchEntreprise;

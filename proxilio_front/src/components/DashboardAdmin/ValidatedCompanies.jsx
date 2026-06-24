/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData, deleteData, patchData } from "../../services/data-fetch";
import { addSubscription } from "./SubscriptionManagement/FunctionForSubscription";
import { FaEdit, FaTrash, FaEye, FaPlusCircle, FaSearch, FaMapMarkerAlt, FaUserAlt, FaStar, FaBriefcase } from "react-icons/fa";
import Modal from "./Modal";
import EditEnterprise from "../Enterprise/EditEnterprise";
import { toast } from "react-toastify";
import Switch from "react-switch";

const ValidatedCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [updatingPremiumId, setUpdatingPremiumId] = useState(null);
  const [premiumDurations, setPremiumDurations] = useState({});

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");

  const navigate = useNavigate();

  const updateCompanyCollections = (companyId, changes) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId ? { ...company, ...changes } : company
      )
    );
    setFilteredCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId ? { ...company, ...changes } : company
      )
    );
    setSelectedCompany((prev) =>
      prev && prev.id === companyId ? { ...prev, ...changes } : prev
    );
  };

  const togglePremiumStatus = async (company, nextValue) => {
    if (nextValue) {
      const selectedDuration = premiumDurations[company.id];
      if (!selectedDuration) {
        toast.error("Sélectionnez d'abord une durée (1 mois ou 1 an)");
        return;
      }
    }

    setUpdatingPremiumId(company.id);
    try {
      const payload = nextValue
        ? {
            isPremium: true,
            duration: premiumDurations[company.id],
          }
        : { isPremium: false };

      const response = await patchData(
        `admin/enterprises/${company.id}/premium`,
        payload
      );
      const updatedValue =
        response?.enterprise?.isPremium ?? Boolean(nextValue);
      const changes = {
        isPremium: updatedValue,
        premiumManualStart: response?.enterprise?.premiumManualStart || null,
        premiumManualEnd: response?.enterprise?.premiumManualEnd || null,
      };
      updateCompanyCollections(company.id, changes);

      const expirationLabel = formatDate(response?.enterprise?.premiumManualEnd);
      toast.success(
        updatedValue
          ? `${company.name} est premium ${
              expirationLabel ? `jusqu'au ${expirationLabel}` : ""
            }`.trim()
          : `${company.name} n'est plus en premium`
      );
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error("Erreur lors de la mise à jour du statut premium");
    } finally {
      setUpdatingPremiumId(null);
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getData("enterprises/validate");
        const normalized = (data || []).map((company) => ({
          ...company,
          isPremium: Boolean(company.isPremium),
        }));
        setCompanies(normalized);
        setFilteredCompanies(normalized);
        setPremiumDurations((prev) => {
          const next = { ...prev };
          normalized.forEach((company) => {
            if (!next[company.id]) {
              next[company.id] = "month";
            }
          });
          return next;
        });
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  // recherche
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = companies.filter((company) => {
      const name = company.name?.toLowerCase() || "";
      const city = company.city?.toLowerCase() || "";
      const zipCode = company.zip_code?.toLowerCase() || "";
      const country = company.country?.name?.toLowerCase() || "";
      const activity = company.job?.name?.toLowerCase() || "";
      const siretNumber = company.siret_number?.toLowerCase() || "";
      const entrepreneurSearch = [company.entrepreneur?.firstname, company.entrepreneur?.lastname, company.entrepreneur?.username].filter(Boolean).join(" ").toLowerCase();
      const averageRating = company.averageRating?.toString().toLowerCase() || "";

      return (
        name.includes(q) ||
        city.includes(q) ||
        zipCode.includes(q) ||
        country.includes(q) ||
        activity.includes(q) ||
        entrepreneurSearch.includes(q) ||
        averageRating.includes(q) ||
        siretNumber.includes(q)
      );
    });
    setFilteredCompanies(filtered);
    setPageIndex(0);
  }, [searchQuery, companies]);

  const confirmDeleteCompany = (company) => {
    setCompanyToDelete(company);
    setIsDeleteConfirmOpen(true);
  };

  const deleteCompany = async () => {
    try {
      await deleteData(`enterprise/${companyToDelete.id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      setFilteredCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      toast.success("Entreprise supprimée avec succès");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Erreur lors de la suppression de l'entreprise");
    } finally {
      setIsDeleteConfirmOpen(false);
      setCompanyToDelete(null);
    }
  };

  const viewCompany = (company) => navigate(`/enterprise/${company.slug || company.id}`);

  const handleSubscriptionSubmit = async () => {
    if (!selectedCompany) return;
    try {
      await addSubscription(selectedCompany.id, subscriptionStatus, subscriptionType);
      toast.success("Abonnement ajouté avec succès");
      setIsSubscriptionModalOpen(false);
      setSubscriptionStatus("");
      setSubscriptionType("");
    } catch (error) {
      console.error("Error ajout subscription:", error);
      toast.error("Erreur lors de l’ajout de l’abonnement");
    }
  };

  // pagination
  const pageCount = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const currentSlice = filteredCompanies.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const primaryIconBtn =
    "h-9 w-9 grid place-items-center rounded-lg border border-black/5 text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] active:scale-[0.98] transition";
  const dangerIconBtn =
    "h-9 w-9 grid place-items-center rounded-lg border border-red-200 text-red-400 hover:bg-red-500 hover:text-white active:scale-[0.98] transition";

  return (
    <div>
      {/* Header + recherche */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
        <div>
          <h2 className="text-base font-light text-[#132A24]">Entreprises validées</h2>
          <p className="text-sm text-[#879f98] font-light">Parcourez, recherchez et gérez les entreprises.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98] w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, métier…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-3 h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] font-light border border-black/5 outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
            className="h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] text-sm font-light border border-black/5 outline-none px-3"
          >
            {[5, 10, 20, 50].map((n) => (
              <option value={n} key={n}>{n} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste / cartes */}
      <div>
        {currentSlice.length === 0 ? (
          <div className="w-full h-32 grid place-items-center rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] text-[#879f98] text-sm font-light">
            Aucune entreprise trouvée.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {currentSlice.map((company) => {
              const country = company.country?.name || "—";
              const job = company.job?.name || "—";
              const entrepreneurName = [company.entrepreneur?.firstname, company.entrepreneur?.lastname].filter(Boolean).join(" ") || company.entrepreneur?.username || "—";
              const rating = company.averageRating ?? "—";
              const manualExpirationLabel = formatDate(company.premiumManualEnd);
              const manualExpirationDate = company.premiumManualEnd ? new Date(company.premiumManualEnd) : null;
              const manualActive =
                manualExpirationDate instanceof Date &&
                !Number.isNaN(manualExpirationDate.getTime()) &&
                manualExpirationDate > new Date();

              return (
                <div
                  key={company.id}
                  className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-[#132A24] font-light text-sm leading-tight">
                          {company.name || "Nom inconnu"}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs font-light px-2 py-0.5 rounded-full border border-amber-200 text-amber-700 bg-amber-50">
                          <FaStar className="w-2.5 h-2.5" />
                          {rating}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Premium</span>
                        <select
                          value={premiumDurations[company.id] || "month"}
                          onChange={(event) => setPremiumDurations((prev) => ({ ...prev, [company.id]: event.target.value }))}
                          className="h-7 rounded-lg border border-black/5 bg-white px-2 text-xs text-[#132A24] font-light focus:outline-none"
                        >
                          <option value="month">1 mois</option>
                          <option value="year">1 an</option>
                        </select>
                        <Switch
                          onChange={(checked) => togglePremiumStatus(company, checked)}
                          checked={Boolean(company.isPremium)}
                          disabled={updatingPremiumId === company.id}
                          offColor="#d4d4d8"
                          onColor="#132A24"
                          uncheckedIcon={false}
                          checkedIcon={false}
                          height={20}
                          width={44}
                        />
                        <span className={`text-xs font-light ${company.isPremium ? "text-[#4b8a74]" : "text-[#879f98]"}`}>
                          {company.isPremium ? "Actif" : "Inactif"}
                        </span>
                        {company.hasActiveSubscription && company.activeSubscriptionType && (
                          <span className="text-[10px] font-light px-2 py-0.5 rounded-full border border-[#4b8a74]/30 text-[#4b8a74] bg-[#eef5f1]">
                            {{ monthly: "Mensuel", yearly: "Annuel", forever: "À vie" }[company.activeSubscriptionType] || company.activeSubscriptionType}
                          </span>
                        )}
                        {updatingPremiumId === company.id && (
                          <span className="text-xs text-[#879f98] font-light">Mise à jour…</span>
                        )}
                      </div>
                      {manualExpirationLabel && company.activeSubscriptionType !== "forever" && (
                        <p className="text-xs text-[#879f98] font-light mb-1">
                          Expiration manuelle : {manualExpirationLabel}{!manualActive && " (expirée)"}
                        </p>
                      )}
                      {company.hasActiveSubscription && (
                        <p className="text-xs text-[#4b8a74] font-light mb-1">Abonnement premium actif</p>
                      )}
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-[#879f98] font-light">
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="w-3 h-3 shrink-0" />
                          <span className="truncate">{company.city || "—"} {company.zip_code ? `(${company.zip_code})` : ""} • {country}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaBriefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{job}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaUserAlt className="w-3 h-3 shrink-0" />
                          <span className="truncate">Entrepreneur : {entrepreneurName}</span>
                        </div>
                        {company.siret_number && (
                          <div className="text-[#879f98]">SIRET : {company.siret_number}</div>
                        )}
                      </div>
                    </div>

                    <div className="md:ml-4 flex md:flex-col gap-2 md:items-end">
                      <button onClick={() => viewCompany(company)} className={primaryIconBtn} title="Voir la fiche">
                        <FaEye />
                      </button>
                      <button onClick={() => { setSelectedCompany(company); setIsEditModalOpen(true); }} className={primaryIconBtn} title="Modifier l'entreprise">
                        <FaEdit />
                      </button>
                      <button onClick={() => { setSelectedCompany(company); setIsSubscriptionModalOpen(true); }} className={primaryIconBtn} title="Ajouter un abonnement">
                        <FaPlusCircle />
                      </button>
                      <button onClick={() => confirmDeleteCompany(company)} className={dangerIconBtn} title="Supprimer l'entreprise">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-5 pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#879f98] font-light">
            Page {pageIndex + 1} / {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="h-8 px-3 rounded-lg text-xs font-light bg-[#f5f7f6] text-[#132A24] border border-black/5 disabled:opacity-40 hover:bg-[#eef5f1] transition"
            >
              « Précédent
            </button>
            <button
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              disabled={pageIndex >= pageCount - 1}
              className="h-8 px-3 rounded-lg text-xs font-light bg-[#f5f7f6] text-[#132A24] border border-black/5 disabled:opacity-40 hover:bg-[#eef5f1] transition"
            >
              Suivant »
            </button>
          </div>
        </div>
      </div>

      {/* Modal édition entreprise (admin) */}
      {isEditModalOpen && selectedCompany && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="max-w-4xl">
          <EditEnterprise
            enterpriseId={selectedCompany.slug || selectedCompany.id}
            onSave={() => setIsEditModalOpen(false)}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* Modal confirmation suppression */}
      {isDeleteConfirmOpen && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
          <div>
            <h2 className="text-base font-light text-[#132A24] mb-2 text-center">Confirmer la suppression</h2>
            <p className="text-[#4b615a] text-sm font-light text-center">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="text-[#132A24]">{companyToDelete?.name}</span> ?
            </p>
            <div className="flex justify-center gap-3 mt-5">
              <button onClick={deleteCompany} className="h-9 px-4 rounded-xl text-sm font-light bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition">
                Supprimer
              </button>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="h-9 px-4 rounded-xl text-sm font-light bg-[#f5f7f6] text-[#4b615a] border border-black/5 hover:bg-[#eef5f1] transition">
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal abonnement */}
      {isSubscriptionModalOpen && (
        <Modal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)}>
          <div>
            <h2 className="text-base font-light text-[#132A24] mb-4 text-center">Ajouter un abonnement</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubscriptionSubmit(); }} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#879f98] font-light block mb-1">Statut</label>
                <select
                  value={subscriptionStatus}
                  onChange={(e) => setSubscriptionStatus(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] font-light border border-black/5 px-3 outline-none focus:border-[#132A24]/30 transition"
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#879f98] font-light block mb-1">Type</label>
                <select
                  value={subscriptionType}
                  onChange={(e) => setSubscriptionType(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] font-light border border-black/5 px-3 outline-none focus:border-[#132A24]/30 transition"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="yearly">Annuel</option>
                  <option value="monthly">Mensuel</option>
                  <option value="forever">À vie</option>
                </select>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button type="submit" className="h-10 px-6 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] transition">
                  Ajouter
                </button>
                <button type="button" onClick={() => setIsSubscriptionModalOpen(false)} className="h-10 px-6 rounded-xl bg-[#f5f7f6] text-[#4b615a] font-light border border-black/5 hover:bg-[#eef5f1] transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ValidatedCompanies;
  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

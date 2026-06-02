/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { getData, putData, deleteData } from "../../services/data-fetch";
import { useSocketIo } from "../../services/UseSocketIo";
import { useAtom } from "jotai";
import { enterprisesAtom } from "../../store/enterprises";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaBriefcase,
  FaSearch,
} from "react-icons/fa";
import Modal from "./Modal";

const NonValidatedCompanies = () => {
  const socket = useSocketIo();

  // ← Setter de l’atom global lu par la sidebar
  const [, setEnterprises] = useAtom(enterprisesAtom);

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [isValidateConfirmOpen, setIsValidateConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [companyToValidate, setCompanyToValidate] = useState(null);
  const [companyToReject, setCompanyToReject] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getData("admin/enterprises/not-validate");
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  // Recherche
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const city = c.city?.toLowerCase() || "";
      const cp = String(c.zip_code || "").toLowerCase();
      const mail = c.mail?.toLowerCase() || "";
      const job = c.job?.name?.toLowerCase() || "";
      const siret = String(c.siret_number || "").toLowerCase();
      return (
        name.includes(q) ||
        city.includes(q) ||
        cp.includes(q) ||
        mail.includes(q) ||
        job.includes(q) ||
        siret.includes(q)
      );
    });
  }, [companies, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSlice = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [search, pageSize]);

  const validateCompany = async (companyId) => {
    try {
      const formData = new FormData();
      formData.append("isValidate", "true");
      await putData(`enterprise/${companyId}`, formData);

      // MAJ locale (liste admin)
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));

      // MAJ immédiate de l’atom global → la sidebar se rafraîchit
      setEnterprises((prev) =>
        Array.isArray(prev)
          ? prev.map((e) => (e.id === companyId ? { ...e, isValidate: true } : e))
          : prev
      );

      // (optionnel) broadcast socket
      socket?.emit("enterpriseValidated", { id: companyId, isValidate: true });
    } catch (error) {
      console.error("Error validating company:", error);
    } finally {
      setIsValidateConfirmOpen(false);
      setCompanyToValidate(null);
    }
  };

  const rejectCompany = async (companyId) => {
    try {
      await deleteData(`admin/enterprises/${companyId}`);

      // MAJ locale
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));

      // MAJ immédiate de l’atom global pour cohérence UI
      setEnterprises((prev) =>
        Array.isArray(prev)
          ? prev.map((e) => (e.id === companyId ? { ...e, isValidate: false } : e))
          : prev
      );

      socket?.emit("enterpriseRejected", { id: companyId, isValidate: false });
    } catch (error) {
      console.error("Error rejecting company:", error);
    } finally {
      setIsRejectConfirmOpen(false);
      setCompanyToReject(null);
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-light text-[#132A24]">Entreprises en attente</h2>
          <span className="text-xs font-light px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {companies.length} à traiter
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98] w-3.5 h-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, ville, SIRET, métier, email…"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] font-light
                       border border-black/5 focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {pageSlice.length === 0 ? (
          <div className="grid place-items-center h-32 rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] text-[#879f98] text-sm font-light">
            Aucune entreprise à afficher.
          </div>
        ) : (
          pageSlice.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition"
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[#132A24] font-light text-sm">{company.name}</h3>
                <span className="text-[10px] font-light px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  en attente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Téléphone / Mail */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaPhone className="w-3 h-3" /> {company.phone || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaEnvelope className="w-3 h-3" /> {company.mail || "—"}
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaMapMarkerAlt className="w-3 h-3" /> {company.adress || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaCity className="w-3 h-3" />
                    {company.city || "—"}
                    {company.zip_code ? `, ${company.zip_code}` : ""}
                  </div>
                </div>

                {/* SIRET / Métier */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaBuilding className="w-3 h-3" /> {company.siret_number || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-[#879f98] text-xs font-light">
                    <FaBriefcase className="w-3 h-3" /> {company.job?.name || "—"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:justify-end items-center gap-2">
                  <button
                    onClick={() => { setCompanyToValidate(company); setIsValidateConfirmOpen(true); }}
                    className="h-8 px-3 rounded-xl text-xs font-light bg-[#eef5f1] text-[#132A24] border border-[#132A24]/15 hover:bg-[#132A24] hover:text-white transition inline-flex items-center gap-1.5"
                    title="Valider l'entreprise"
                  >
                    <FaCheckCircle /> <span className="hidden md:inline">Valider</span>
                  </button>
                  <button
                    onClick={() => { setCompanyToReject(company); setIsRejectConfirmOpen(true); }}
                    className="h-8 px-3 rounded-xl text-xs font-light bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition inline-flex items-center gap-1.5"
                    title="Refuser l'entreprise"
                  >
                    <FaTimesCircle /> <span className="hidden md:inline">Refuser</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-5 pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[#879f98] font-light">
          {filtered.length} résultat(s) — page {pageIndex + 1} / {pageCount}
        </span>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 rounded-lg bg-[#f5f7f6] text-[#132A24] border border-black/5 px-2 text-xs font-light"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>

          {[
            { label: "Début", action: () => setPageIndex(0), disabled: pageIndex === 0 },
            { label: "«", action: () => setPageIndex((p) => Math.max(0, p - 1)), disabled: pageIndex === 0 },
            { label: "»", action: () => setPageIndex((p) => Math.min(pageCount - 1, p + 1)), disabled: pageIndex >= pageCount - 1 },
            { label: "Fin", action: () => setPageIndex(pageCount - 1), disabled: pageIndex >= pageCount - 1 },
          ].map(({ label, action, disabled }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              className="h-8 px-3 rounded-lg text-xs font-light bg-[#f5f7f6] text-[#132A24] border border-black/5 disabled:opacity-40 hover:bg-[#eef5f1] transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal validation */}
      {isValidateConfirmOpen && (
        <Modal isOpen={isValidateConfirmOpen} onClose={() => setIsValidateConfirmOpen(false)}>
          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h3 className="text-base font-light text-[#132A24] text-center">Valider l&apos;entreprise</h3>
            <p className="text-[#4b615a] text-sm font-light text-center mt-2">
              Confirmer la validation de <span className="text-[#132A24]">{companyToValidate?.name}</span> ?
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => validateCompany(companyToValidate.id)}
                className="h-9 px-4 rounded-xl bg-[#eef5f1] text-[#132A24] border border-[#132A24]/15 font-light hover:bg-[#132A24] hover:text-white transition text-sm"
              >
                Valider
              </button>
              <button
                onClick={() => setIsValidateConfirmOpen(false)}
                className="h-9 px-4 rounded-xl bg-[#f5f7f6] text-[#4b615a] border border-black/5 font-light hover:bg-[#eef5f1] transition text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal rejet */}
      {isRejectConfirmOpen && (
        <Modal isOpen={isRejectConfirmOpen} onClose={() => setIsRejectConfirmOpen(false)}>
          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h3 className="text-base font-light text-[#132A24] text-center">Rejeter l&apos;entreprise</h3>
            <p className="text-[#4b615a] text-sm font-light text-center mt-2">
              Confirmer le rejet de <span className="text-[#132A24]">{companyToReject?.name}</span> ?
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => rejectCompany(companyToReject.id)}
                className="h-9 px-4 rounded-xl bg-red-50 text-red-500 border border-red-200 font-light hover:bg-red-500 hover:text-white transition text-sm"
              >
                Rejeter
              </button>
              <button
                onClick={() => setIsRejectConfirmOpen(false)}
                className="h-9 px-4 rounded-xl bg-[#f5f7f6] text-[#4b615a] border border-black/5 font-light hover:bg-[#eef5f1] transition text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NonValidatedCompanies;

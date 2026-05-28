import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { getData } from "../../services/data-fetch";
import { enterprisesAtom } from "../../store/enterprises";
import EditEnterpriseModal from "@/components/Enterprise/ComponentsForEnterprise/EditEnterpriseModal";
import ReservationSummary from "@/components/Enterprise/ComponentsForEnterprise/ReservationSummary";
import StatsSummary from "@/components/Enterprise/ComponentsForStats/StatsSummary";

export default function StatsEnterprises() {
  const { id } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const navigate = useNavigate();
  const [, setEnterprises] = useAtom(enterprisesAtom);

  useEffect(() => {
    const fetchEnterprise = async () => {
      try {
        const data = await getData(`enterprise/${id}`);
        setEnterprise(data);
      } catch (error) {
        console.error("Error fetching enterprise:", error);
      }
    };
    fetchEnterprise();
  }, [id]);

  const handleEditClick = () => setIsEditFormOpen(true);
  const handleCloseEditForm = () => setIsEditFormOpen(false);

  const handleSave = (updatedCompany) => {
    setEnterprise(updatedCompany);
    handleCloseEditForm();
  };

  const handleViewClick = () => {
    if (enterprise) navigate(`/enterprise/${enterprise.id}`);
  };

  const handlePremiumRevoked = () => {
    setEnterprise((prev) => prev ? { ...prev, isPremium: false } : prev);
    setEnterprises((prev) =>
      Array.isArray(prev)
        ? prev.map((e) => (String(e.id) === String(id) ? { ...e, isPremium: false } : e))
        : prev
    );
  };

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6 mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Entreprise</p>
          <h2 className="text-xl font-light text-[#132A24] tracking-tight">
            {enterprise ? enterprise.name : "Chargement…"}
          </h2>
        </div>
      </div>

      <ReservationSummary
        enterprise={enterprise}
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      <div className="mt-6">
        <StatsSummary enterprise={enterprise} onPremiumRevoked={handlePremiumRevoked} />
      </div>

      {isEditFormOpen && (
        <EditEnterpriseModal
          enterpriseId={id}
          onSave={handleSave}
          onClose={handleCloseEditForm}
        />
      )}
    </div>
  );
}

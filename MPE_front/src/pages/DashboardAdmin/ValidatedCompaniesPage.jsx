import ValidatedCompanies from "../../components/DashboardAdmin/ValidatedCompanies";

const ValidatedCompaniesPage = () => {
    return (
        <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6 mt-6 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
            <h2 className="text-xl font-light text-[#132A24] tracking-tight mb-1">Liste des entreprises validées</h2>
            <div className="border-t border-black/5 mt-4 pt-6">
                <ValidatedCompanies />
            </div>
        </div>
    );
};

export default ValidatedCompaniesPage;

import EditProfilForm from "../../components/User/EditProfilForm";
import LikesManagement from "../../components/DashboardUser/User_likes";
import UserAgenda from "@/components/DashboardUser/User_agenda";
import CommentsOfUser from "@/components/DashboardUser/Company_coms";

const SectionCard = ({ children, className = "" }) => (
  <div className={`bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] ${className}`}>
    {children}
  </div>
);

const Companydb = () => {
  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-2">Espace personnel</p>
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-[#132A24]">
            Tableau de bord
          </h1>
          <p className="mt-1.5 text-[#879f98] font-light text-sm">
            Gérez votre profil, vos favoris, vos réservations et vos avis.
          </p>
        </header>

        <div className="flex flex-col gap-6">

          {/* Profil + Favoris */}
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
            <SectionCard>
              <div className="px-5 pt-5 pb-4 border-b border-black/5">
                <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Compte</p>
                <h2 className="text-base font-light text-[#132A24] tracking-tight">Gestion du profil</h2>
              </div>
              <div className="p-5 lg:p-6">
                <EditProfilForm />
              </div>
            </SectionCard>

            <SectionCard>
              <div className="px-5 pt-5 pb-4 border-b border-black/5">
                <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Sélection</p>
                <h2 className="text-base font-light text-[#132A24] tracking-tight">Mes favoris</h2>
              </div>
              <div className="p-5">
                <LikesManagement />
              </div>
            </SectionCard>
          </div>

          {/* Réservations */}
          <SectionCard>
            <div className="px-5 pt-5 pb-4 border-b border-black/5">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Agenda</p>
              <h2 className="text-base font-light text-[#132A24] tracking-tight">Mes réservations</h2>
              <p className="text-xs text-[#879f98] font-light mt-0.5">
                Retrouvez l&apos;ensemble de vos rendez-vous à venir et passés.
              </p>
            </div>
            <div className="p-5 lg:p-6">
              <UserAgenda />
            </div>
          </SectionCard>

          {/* Commentaires */}
          <SectionCard>
            <div className="px-5 pt-5 pb-4 border-b border-black/5">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Avis</p>
              <h2 className="text-base font-light text-[#132A24] tracking-tight">Mes commentaires</h2>
            </div>
            <div className="p-5">
              <CommentsOfUser />
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

export default Companydb;

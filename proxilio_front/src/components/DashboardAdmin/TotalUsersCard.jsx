/* eslint-disable react/prop-types */

const TotalUsersCard = ({ totalUsers }) => {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5">
      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Utilisateurs</p>
      <p className="text-2xl font-light text-[#132A24]">{totalUsers}</p>
    </div>
  );
};

export default TotalUsersCard;

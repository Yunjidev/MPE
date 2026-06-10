/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { putData } from "../../services/data-fetch";
import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";

const inputCls =
  "w-full pl-9 pr-3 h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] font-light border border-black/5 focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition";

const EditUserForm = ({ user, onClose, onSave }) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      isAdmin: false,
      isEntrepreneur: false,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        isAdmin: user.isAdmin || false,
        isEntrepreneur: user.isEntrepreneur || false,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const userUpdate = {};
    if (data.username !== user.username) userUpdate.username = data.username;
    if (data.firstname !== user.firstname) userUpdate.firstname = data.firstname;
    if (data.lastname !== user.lastname) userUpdate.lastname = data.lastname;
    if (data.email !== user.email) userUpdate.email = data.email;
    if (data.isAdmin !== user.isAdmin) userUpdate.isAdmin = data.isAdmin;
    if (data.isEntrepreneur !== user.isEntrepreneur) userUpdate.isEntrepreneur = data.isEntrepreneur;

    try {
      await putData(`admin/user/${user.id}`, userUpdate);
      onSave({ ...user, ...userUpdate });
      alert("Utilisateur mis à jour avec succès");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      alert("Échec de la mise à jour de l'utilisateur");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
        <h2 className="text-base font-light text-[#132A24] tracking-tight">Édition Utilisateur</h2>
      </div>
      <hr className="border-black/5" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="relative flex items-center">
          <FaUser className="absolute left-3 text-[#879f98] w-3.5 h-3.5" />
          <input
            id="username"
            type="text"
            {...register("username", { required: true })}
            placeholder="Nom d'utilisateur"
            className={inputCls}
          />
        </div>
        <div className="relative flex items-center">
          <FaIdBadge className="absolute left-3 text-[#879f98] w-3.5 h-3.5" />
          <input
            id="firstname"
            type="text"
            {...register("firstname", { required: true })}
            placeholder="Prénom"
            className={inputCls}
          />
        </div>
        <div className="relative flex items-center">
          <FaIdBadge className="absolute left-3 text-[#879f98] w-3.5 h-3.5" />
          <input
            id="lastname"
            type="text"
            {...register("lastname", { required: true })}
            placeholder="Nom"
            className={inputCls}
          />
        </div>
        <div className="relative flex items-center">
          <FaEnvelope className="absolute left-3 text-[#879f98] w-3.5 h-3.5" />
          <input
            id="email"
            type="email"
            {...register("email", { required: true })}
            placeholder="Adresse e-mail"
            className={inputCls}
          />
        </div>
        <div className="flex gap-6 py-1">
          <label className="flex items-center gap-2 text-sm text-[#4b615a] font-light cursor-pointer">
            <input id="isAdmin" type="checkbox" {...register("isAdmin")} className="accent-[#132A24]" />
            Admin
          </label>
          <label className="flex items-center gap-2 text-sm text-[#4b615a] font-light cursor-pointer">
            <input id="isEntrepreneur" type="checkbox" {...register("isEntrepreneur")} className="accent-[#132A24]" />
            Entrepreneur
          </label>
        </div>
        <button
          type="submit"
          className="w-full h-10 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] active:scale-[0.98] transition-all mt-2"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default EditUserForm;

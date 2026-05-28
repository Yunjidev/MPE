import { useNavigate } from "react-router-dom";
import { postData } from "../../services/data-fetch";
import EnterpriseForm from "./Form/EnterpriseForm";
import { toast } from "react-toastify";
import { useAtom } from "jotai";
import { enterprisesAtom } from "../../store/enterprises";

export default function CreateEnterprise() {
  const navigate = useNavigate();
  const [, setEnterprise] = useAtom(enterprisesAtom);

  const handleSubmit = async (formData) => {
    try {
      const response = await postData("enterprise", formData);
      setEnterprise((prev) => [...prev, response.enterprise]);
      navigate(`/dashboard/user-db`);
      toast.success("Entreprise créée avec succès !");
    } catch (error) {
      try {
        const errorData = JSON.parse(error.message);
        if (Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err) => {
            const msg = typeof err === "string" ? err : err.msg || Object.values(err)[0];
            toast.error(msg);
          });
        } else if (typeof errorData.errors === "string") {
          toast.error(errorData.errors);
        } else {
          toast.error("Une erreur est survenue, veuillez réessayer.");
        }
      } catch {
        toast.error(error.message || "Une erreur est survenue, veuillez réessayer.");
      }
    }
  };

  return (
    <div>
      <EnterpriseForm title="Création d'entreprise" onSubmit={handleSubmit} />
    </div>
  );
}

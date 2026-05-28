import { authSignInUp } from "../../services/auth-fetch";
import { useNavigate, useLocation, Link } from "react-router-dom";
import UserForm from "./UserForm";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { enterprisesAtom } from "../../store/enterprises";
import { toast } from "react-toastify";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUser] = useAtom(userAtom);
  const [, setEnterprises] = useAtom(enterprisesAtom);

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/dashboard/user-db";

  const handleSubmit = async (data) => {
    try {
      const userData = await authSignInUp("signin", data);
      setUser({
        ...userData.user,
        isLogged: true,
      });
      setEnterprises(userData.enterprises);
      navigate(redirectTo);
      toast.success("Authentification réussie");
    } catch (error) {
      const errorData = await JSON.parse(error.message);
      toast.error(errorData.errors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="w-full max-w-md">
        <UserForm onSubmit={handleSubmit} mode="Connexion" />
        <p className="mt-5 text-center text-sm font-light text-[#879f98]">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-[#132A24] underline underline-offset-4 hover:text-[#4b8a74] transition-colors">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

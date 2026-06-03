import { useNavigate, Link, useSearchParams } from "react-router-dom";
import UserForm from "./UserForm";
import GoogleAuthButton from "./GoogleAuthButton";
import { authSignInUp } from "../../services/auth-fetch";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { toast } from "react-toastify";

export default function SignUp() {
  const navigate = useNavigate();
  const [, setUser] = useAtom(userAtom);
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  const handleSubmit = async (formData) => {
    try {
      if (refCode) formData.append("referral_code", refCode);
      const response = await authSignInUp("signup", formData, setUser);
      const userData = await response;
      setUser({
        ...userData.user,
        enterprises: userData.enterprises,
        isLogged: true,
      });
      navigate("/dashboard/user-db");
      toast.success("Inscription réussie");
    } catch (error) {
      const errorData = await JSON.parse(error.message);
      if (Array.isArray(errorData.errors)) {
        errorData.errors.forEach((error) => {
          const [, message] = Object.entries(error)[0];
          toast.error(`${message}`);
        });
      } else {
        toast.error(errorData.errors);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md">
        <UserForm onSubmit={handleSubmit} mode="Inscription" />
        <GoogleAuthButton redirectTo="/dashboard/user-db" />
        <p className="mt-5 text-center text-sm font-light text-[#879f98]">
          Déjà un compte ?{" "}
          <Link to="/signin" className="text-[#132A24] underline underline-offset-4 hover:text-[#4b8a74] transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

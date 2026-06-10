import { Navigate, Outlet } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../store/user";

const PrivateRoute = () => {
  const [user] = useAtom(userAtom);

  return user?.isLogged ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;

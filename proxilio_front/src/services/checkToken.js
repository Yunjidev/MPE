import Cookies from "js-cookie";
import { authSignInUp } from "./auth-fetch";

export const validateRefreshToken = async () => {
  const refreshToken = Cookies.get("mpe-refresh");
  if (!refreshToken) return null;

  try {
    const data = await authSignInUp("validate-refresh-token", { refreshToken });
    return { user: data.user, enterprises: data.enterprises || [] };
  } catch {
    Cookies.remove("mpe-auth");
    Cookies.remove("mpe-refresh");
    return null;
  }
};

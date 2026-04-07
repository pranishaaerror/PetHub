import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../Firebase";
import { queryClient } from "../lib/queryClient";
import { clearStoredAuth } from "../utils/authSession";

const auth = getAuth(app);

export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        clearStoredAuth();
        queryClient.clear();
        navigate("/", { replace: true });
      }
    };

    logout();
  }, [navigate]);

  return null;
};

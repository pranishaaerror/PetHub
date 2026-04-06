import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../Firebase";

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
          localStorage.removeItem("userToken");
          localStorage.removeItem("userInfo");
          navigate("/");
        }
      };

      logout();
   	},[navigate])
    return <></>

}

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const LogoutPage = () => {
    const navigate = useNavigate();
   useEffect(() => {
	 	localStorage.setItem('userToken', "");
    	navigate("/");
   	},[navigate])
    return <></>

}
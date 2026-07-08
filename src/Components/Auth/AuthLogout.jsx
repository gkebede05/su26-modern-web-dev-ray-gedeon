import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "./AuthService.jsx";

const AuthLogout = () => {
  const navigate = useNavigate();

  // Student B: call the Parse logout service, then return the user to auth.
  useEffect(() => {
    logoutUser().then(() => {
      navigate("/auth", { replace: true });
    });
  }, [navigate]);

  return <p>Logging out...</p>;
};

export default AuthLogout;

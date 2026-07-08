import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkUser } from "./AuthService.jsx";

const AuthModule = () => {
  const navigate = useNavigate();

  // Student B: do not let a logged-in user manually return to the auth landing page.
  useEffect(() => {
    if (checkUser()) {
      navigate("/authenticated", { replace: true });
    }
  }, [navigate]);

  return (
    <div>
      <h1>Authentication</h1>
      <Link to="/auth/register">
        <button type="button">Register</button>
      </Link>
      <br />
      <br />
      <Link to="/auth/login">
        <button type="button">Login</button>
      </Link>
    </div>
  );
};

export default AuthModule;

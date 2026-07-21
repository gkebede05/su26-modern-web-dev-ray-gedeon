import { Navigate } from "react-router-dom";
import { checkUser } from "../Components/Auth/AuthService.jsx";

const ProtectedRoute = ({ element: Component }) => {
  // Uses the Student B auth service helper instead of directly reading Parse here.
  return checkUser() ? <Component /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;

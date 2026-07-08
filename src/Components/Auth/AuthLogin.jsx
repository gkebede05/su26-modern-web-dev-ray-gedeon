import { useState, useEffect } from "react";
import { loginUser } from "./AuthService.jsx";
import { Navigate, useNavigate, Link } from "react-router-dom";
import AuthForm from "./AuthForm.jsx";
// import ProtectedRoute from "../../Service/ProtectedRoute.js";

const AuthLogin = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    e.preventDefault();
    console.log(e.target);
    const { name, value: newValue } = e.target;
    console.log(newValue);
    setUser({ ...user, [name]: newValue });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log(e.target);

    loginUser(user.email, user.password).then((loggedInUser) => {
      console.log("loggedInUser:", loggedInUser);
      if (loggedInUser) {
        alert(`Welcome, ${loggedInUser.get("firstname")}!`);
        navigate("/about");
      }
    });
  };

  return (
    <div>
      <h1>Login</h1>
      <AuthForm
        user={user}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
        isRegister={false}
      />
      <br />
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
};

export default AuthLogin;

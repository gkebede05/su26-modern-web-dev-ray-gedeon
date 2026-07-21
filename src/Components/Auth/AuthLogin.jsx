import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkUser, loginUser } from "./AuthService.jsx";
import AuthForm from "./AuthForm.jsx";

const AuthLogin = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    email: "",
    password: "",
  });

  // Student B: flag variable tells React when the login form has been submitted.
  const [login, setLogin] = useState(false);

  // Student B: already authenticated users should not manually return to login.
  useEffect(() => {
    if (checkUser()) {
      navigate("/authenticated", { replace: true });
    }
  }, [navigate]);

  // Student B: login is asynchronous, so it lives inside useEffect.
  useEffect(() => {
    if (currentUser && login) {
      loginUser(currentUser).then((loggedInUser) => {
        if (loggedInUser) {
          const firstName = loggedInUser.get("firstName");
          alert(`Welcome, ${firstName}!`);
          navigate("/authenticated", { replace: true });
        }
        setLogin(false);
      });
    }
  }, [currentUser, login, navigate]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    const { name, value: newValue } = e.target;

    // Student B: keep the previous form data and update only the changed input.
    setCurrentUser((previousUser) => ({ ...previousUser, [name]: newValue }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setLogin(true);
  };

  return (
    <div>
      <h1>Login</h1>
      <AuthForm
        user={currentUser}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
        isRegister={false}
      />
      <br />
      <Link to="/auth/register">
        <button type="button">Need an account? Register</button>
      </Link>
    </div>
  );
};

export default AuthLogin;

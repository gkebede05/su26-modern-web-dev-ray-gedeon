import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkUser, createUser } from "./AuthService.jsx";
import AuthForm from "./AuthForm.jsx";

const AuthRegister = () => {
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Student B: flag variable tells React when the register form has been submitted.
  const [add, setAdd] = useState(false);

  // Student B: already authenticated users should not manually return to register.
  useEffect(() => {
    if (checkUser()) {
      navigate("/authenticated", { replace: true });
    }
  }, [navigate]);

  // Student B: register is asynchronous, so it lives inside useEffect.
  useEffect(() => {
    if (newUser && add) {
      createUser(newUser).then((userCreated) => {
        if (userCreated) {
          alert(`${userCreated.get("firstName")}, you successfully registered.`);
          navigate("/authenticated", { replace: true });
        }
        setAdd(false);
      });
    }
  }, [newUser, add, navigate]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    const { name, value: newValue } = e.target;

    // Student B: keep the previous form data and update only the changed input.
    setNewUser((previousUser) => ({ ...previousUser, [name]: newValue }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setAdd(true);
  };

  return (
    <div>
      <h1>Register</h1>
      <AuthForm
        user={newUser}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
        isRegister={true}
      />
      <br />
      <Link to="/auth/login">
        <button type="button">Already registered? Login</button>
      </Link>
    </div>
  );
};

export default AuthRegister;

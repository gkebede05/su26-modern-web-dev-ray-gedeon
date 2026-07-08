import { useState, useEffect } from "react";
import { createUser } from "./AuthService.jsx";
import { Link } from "react-router-dom";
import AuthForm from "./AuthForm.jsx";

const AuthRegister = () => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // flag is the state to for add/remove updates
  const [add, setAdd] = useState(false);

  useEffect(() => {
    if (newUser && add) {
      createUser(newUser).then((userCreated) => {
        if (userCreated) {
          alert(
            `${userCreated.get("firstname")}, you successfully registered.`
          );
        }
        setAdd(false);
      });
    }
  }, [newUser, add]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    console.log(e.target);
    const { name, value: newValue } = e.target;
    console.log(newValue);
    setNewUser({ ...newUser, [name]: newValue });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log(e.target);
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
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
};

export default AuthRegister;

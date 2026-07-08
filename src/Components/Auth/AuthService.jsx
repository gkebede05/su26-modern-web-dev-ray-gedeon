import Parse from "parse";

export const createUser = (newUser) => {
  const user = new Parse.User();

  user.set("username", newUser.email);
  user.set("firstname", newUser.firstName);
  user.set("lastname", newUser.lastName);
  user.set("email", newUser.email);
  user.set("password", newUser.password);

  return user
    .signUp()
    .then((newUserSaved) => {
      return newUserSaved;
    })
    .catch((error) => {
      alert(`Error: ${error.message}`);
    });
};

export const loginUser = (email, password) => {
  return Parse.User.logIn(email, password)
    .then(() => {
      return Parse.User.current();
    })
    .catch((error) => {
      alert(`Error: ${error.message}`);
    });
};

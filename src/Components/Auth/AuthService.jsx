import Parse from "parse";

// Student B: service method for creating/registering a Parse user.
export const createUser = (newUser) => {
  const user = new Parse.User();

  // Parse requires username and password; this app uses email as the username.
  user.set("username", newUser.email);
  user.set("email", newUser.email);
  user.set("password", newUser.password);

  // Extra fields are saved on the User class for display after registration/login.
  user.set("firstName", newUser.firstName);
  user.set("lastName", newUser.lastName);

  return user
    .signUp()
    .then((newUserSaved) => newUserSaved)
    .catch((error) => {
      alert(`Error: ${error.message}`);
      return null;
    });
};

// Student B: service method for logging in an existing Parse user.
export const loginUser = (currentUser) => {
  return Parse.User.logIn(currentUser.email, currentUser.password)
    .then((loggedInUser) => loggedInUser)
    .catch((error) => {
      alert(`Error: ${error.message}`);
      return null;
    });
};

// Student B: service method for logging out the current Parse user.
export const logoutUser = () => {
  return Parse.User.logOut()
    .then(() => true)
    .catch((error) => {
      alert(`Error: ${error.message}`);
      return false;
    });
};

// Student B: helper method used by auth pages to block logged-in users from auth routes.
export const checkUser = () => {
  const currentUser = Parse.User.current();
  return currentUser ? currentUser.authenticated() : false;
};

// Student B: helper method for reading the logged-in user when we need display data.
export const getCurrentUser = () => Parse.User.current();

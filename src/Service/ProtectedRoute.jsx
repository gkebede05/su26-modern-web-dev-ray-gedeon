import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Parse from "parse";

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const navigate = useNavigate();
  const goBackHandler = () => {
    navigate("/");
  };
  console.log("rest: ", rest);

  const currentUser = Parse.User.current();

  return (
    <div>
      {currentUser.authenticated() ? (
        <Component />
      ) : (
        <div>
          <p>Unauthorized!</p> <button onClick={goBackHandler}>Go Back.</button>
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute;

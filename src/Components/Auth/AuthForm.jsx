const AuthForm = ({ user, onChange, onSubmit, isRegister }) => {
  return (
    <form onSubmit={onSubmit}>
      {isRegister && (
        <div>
          <div>
            <label>First Name</label>
            <br />
            <input
              type="text"
              value={user.firstName}
              onChange={onChange}
              name="firstName"
              placeholder="first name"
              required
            />
          </div>
          <div>
            <label>Last Name</label>
            <br />
            <input
              type="text"
              value={user.lastName}
              onChange={onChange}
              name="lastName"
              placeholder="last name"
              required
            />
          </div>
        </div>
      )}
      <div>
        <label>Email</label>
        <br />
        <input
          type="email"
          value={user.email}
          onChange={onChange}
          name="email"
          placeholder="email"
          required
        />
      </div>
      <div>
        <label>Password</label>
        <br />
        <input
          type="password"
          value={user.password}
          onChange={onChange}
          name="password"
          placeholder="Password"
          required
        />
      </div>
      <br />
      <div>
        <button type="submit" onSubmit={onSubmit}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default AuthForm;

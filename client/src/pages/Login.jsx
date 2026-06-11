import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const Login = () => {
  const initialUser = {
    email: "",
    password: "",
  };

  const [user, setUser] = useState(initialUser);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusType("");

    try {
      setLoading(true);

      const payload = {
        email: user.email.trim().toLowerCase(),
        password: user.password,
      };

      await loginUser(payload);

      setStatus("Login successful!");
      setStatusType("success");

      setTimeout(() => {
        navigate("/scene");
      }, 800);
    } catch (error) {
      console.error("Error logging in:", error);
      setStatus(error.response?.data?.message || "Login failed. Try again.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginUser">
        <div className="RoomBuilderLogo">
          <h1>RoomBuilder</h1>
        </div>

        <h2 className="loginTitle">Login</h2>

        <form className="loginForm" onSubmit={submitForm}>
          <div className="formgroup">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={inputHandler}
              className="form-control"
              placeholder="Enter email"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={inputHandler}
              className="form-control"
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />

            {status && <div className={`status ${statusType}`}>{status}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-success submitBtn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signupText">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";

const Signup = () => {
  const initialUser = {
    fullname: "",
    username: "",
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

    if (
      !user.fullname.trim() ||
      !user.username.trim() ||
      !user.email.trim() ||
      !user.password
    ) {
      setStatus("Please fill in all fields.");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullname: user.fullname.trim(),
        username: user.username.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
      };

      await signupUser(payload);

      setStatus("Signup successful! Please login.");
      setStatusType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Error signing up:", error);
      setStatus(error.response?.data?.message || "Signup failed. Try again.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signupPage">
      <div className="signupUser">
        <div className="RoomBuilderLogo">
          <h1>RoomBuilder</h1>
        </div>

        <h2 className="signupTitle">Create Account</h2>

        <form className="signupForm" onSubmit={submitForm}>
          <div className="formgroup">
            <label htmlFor="fullname">Full Name:</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={user.fullname}
              onChange={inputHandler}
              className="form-control"
              placeholder="Enter full name"
              autoComplete="name"
              required
            />

            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={inputHandler}
              className="form-control"
              placeholder="Enter username"
              autoComplete="username"
              required
            />

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
              autoComplete="new-password"
              minLength="6"
              required
            />

            {status && <div className={`status ${statusType}`}>{status}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-success submitBtn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="loginText">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
import axios from "axios";

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  const hostname = window.location.hostname;

  return `http://${hostname}:8000/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Auth APIs
export const signupUser = (userData) => {
  return api.post("/signup", userData);
};

export const loginUser = (userData) => {
  return api.post("/login", userData);
};

export const getCurrentUser = () => {
  return api.get("/me");
};

export const logoutUser = () => {
  return api.post("/logout");
};

// Scene APIs
export const saveScene = (objects) => {
  return api.post("/scenes/save", {
    objects,
  });
};

export const loadScene = () => {
  return api.get("/scenes");
};

export default api;
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    };

    verifySession();
  }, []);

  if (checkingSession) {
    return <div className="sceneLoading">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
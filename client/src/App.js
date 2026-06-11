import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ScenePage from "./pages/ScenePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/scene"
          element={
            <ProtectedRoute>
              <ScenePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
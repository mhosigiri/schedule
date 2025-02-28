// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import WeeklySchedule from "./components/WeeklySchedule";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import ActivityTimeline from "./components/ActivityTimeline";
import ForgotPassword from "./components/auth/ForgotPassword";
import NotFound from "./components/auth/NotFound";
import VerifyEmail from "./components/auth/VerifyEmail";
import CompleteSignup from "./components/auth/CompleteSignup";
import "./App.css";

// Private route component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <ActivityTimeline />
                </PrivateRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <PrivateRoute>
                  <WeeklySchedule />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/complete-signup" element={<CompleteSignup />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

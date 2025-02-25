// src/components/auth/AuthContainer.tsx
import React, { useState } from "react";
import Login from "./login";
import Signup from "./signup";
import "./Auth.css";

// Define the props interface for the AuthContainer component
export interface AuthContainerProps {
  onAuthSuccess?: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="traffic-light">
            <div className="light red"></div>
            <div className="light yellow"></div>
            <div className="light green"></div>
          </div>
          <h1>Weekly Schedule</h1>
        </div>

        {showLogin ? (
          <Login
            onLoginSuccess={onAuthSuccess}
            onSignupClick={() => setShowLogin(false)}
          />
        ) : (
          <Signup
            onSignupSuccess={onAuthSuccess}
            onLoginClick={() => setShowLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiCheck } from "react-icons/fi";
import "./AuthStyles.css";

const CompleteSignup: React.FC = () => {
  const [_, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, password, name, verified } = location.state || {};

  useEffect(() => {
    if (!verified || !email || !password || !name) {
      navigate("/signup");
      return;
    }

    const completeSignup = async () => {
      try {
        await signup(email, password, name);
        // Wait a moment to show success message
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error: any) {
        setError(error.message || "Failed to create account");
        setLoading(false);
      }
    };

    completeSignup();
  }, [email, password, name, verified, signup, navigate]);

  if (error) {
    return (
      <div className="auth-page dark">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="app-title">Schedule</h1>
              <h2>Error</h2>
              <p>{error}</p>
            </div>
            <button onClick={() => navigate("/signup")} className="auth-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page dark">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="app-title">Schedule</h1>
            <div className="success-icon">
              <FiCheck />
            </div>
            <h2>Account Created!</h2>
            <p>
              Your account has been successfully created. Redirecting to
              dashboard...
            </p>
          </div>
        </div>
      </div>
      <div className="auth-background">
        <div className="auth-background-pattern"></div>
      </div>
    </div>
  );
};

export default CompleteSignup;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiCheck } from "react-icons/fi";
import "./AuthStyles.css";

const CompleteSignup: React.FC = () => {
  const [_, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState(
    "Account Created! Redirecting to dashboard..."
  );
  const { signup, login } = useAuth();
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
        setIsSuccess(true);
        // Wait a moment to show success message
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error: any) {
        // Check if this is an "email-already-in-use" error
        if (error.code === "auth/email-already-in-use") {
          // Handle this case by logging in instead
          try {
            setRedirectMessage("Account exists! Signing you in...");
            setIsSuccess(true);
            await login(email, password);
            // Wait a moment to show success message
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } catch (loginError: any) {
            // If login fails, redirect to login page
            setRedirectMessage("Account exists! Redirecting to login...");
            setIsSuccess(true);
            setTimeout(() => {
              navigate("/login", { state: { email } });
            }, 2000);
          }
        } else {
          // Handle other errors
          setError(error.message || "Failed to create account");
          setLoading(false);
        }
      }
    };

    completeSignup();
  }, [email, password, name, verified, signup, login, navigate]);

  if (error) {
    return (
      <div className="auth-page dark">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="app-title">YourWeek</h1>
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
            <h1 className="app-title">YourWeek</h1>
            <div className="success-icon">
              <FiCheck />
            </div>
            <h2>{isSuccess ? "Success!" : "Creating Account..."}</h2>
            <p>{redirectMessage}</p>
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

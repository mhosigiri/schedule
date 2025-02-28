// src/components/Signup.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiSun, FiMoon } from "react-icons/fi";
import "./AuthStyles.css";
import { verificationService } from "../../services/VerificationService";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      // Generate verification code
      const verificationCode = verificationService.generateVerificationCode();

      // Store code in database
      await verificationService.storeVerificationCode(email, verificationCode);

      // Use the new method that handles fallbacks internally without showing errors
      const emailSent = await verificationService.sendEmailWithFallback(
        email,
        verificationCode
      );

      if (!emailSent) {
        setError(
          "Failed to send verification email. Please try again or contact support."
        );
        setLoading(false);
        return;
      }

      // Navigate to verification page
      navigate("/verify-email", {
        state: { email, password, name },
      });
    } catch (error: any) {
      setError(error.message || "Failed to create an account");
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`auth-page ${isDarkMode ? "dark" : "light"}`}>
      <div className="theme-toggle-container">
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="app-title">YourWeek</h1>
            <h2>Create Account</h2>
            <p>Sign up to start organizing your time</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="auth-input">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-input">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-input">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
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

export default Signup;

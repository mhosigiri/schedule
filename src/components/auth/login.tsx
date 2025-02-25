// src/components/auth/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginProps {
  onLoginSuccess?: () => void;
  onSignupClick?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignupClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Your Schedule</h2>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-links">
        <button className="text-button" onClick={onSignupClick}>
          Need an account? Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;

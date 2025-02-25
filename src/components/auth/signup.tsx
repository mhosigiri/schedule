// src/components/auth/Signup.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface SignupProps {
  onSignupSuccess?: () => void;
  onLoginClick?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await signup(email, password, displayName);
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create an Account</h2>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password-confirm">Confirm Password</label>
          <input
            type="password"
            id="password-confirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="auth-links">
        <button className="text-button" onClick={onLoginClick}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default Signup;

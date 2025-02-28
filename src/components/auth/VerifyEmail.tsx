import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verificationService } from "../../services/VerificationService";
import { FiSun, FiMoon, FiArrowLeft } from "react-icons/fi";
import "./AuthStyles.css";

const VerifyEmail: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, name } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const isValid = await verificationService.verifyCode(
        email,
        verificationCode
      );

      if (isValid) {
        // Complete the signup process
        navigate("/complete-signup", {
          state: { email, password, name, verified: true },
        });
      } else {
        setError("Invalid or expired verification code");
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError("");

      // Generate new code
      const newCode = verificationService.generateVerificationCode();

      // Store in database
      await verificationService.storeVerificationCode(email, newCode);

      // Use the new method that handles fallbacks internally without showing errors
      const emailSent = await verificationService.sendEmailWithFallback(
        email,
        newCode
      );

      if (!emailSent) {
        setError("Failed to send verification email. Please try again later.");
        setLoading(false);
        return;
      }

      // Reset countdown
      setCountdown(60);
      setCanResend(false);

      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      setError(error.message || "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goBack = () => {
    navigate("/signup");
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
          <div className="back-button" onClick={goBack}>
            <FiArrowLeft /> Back
          </div>

          <div className="auth-header">
            <h1 className="app-title">YourWeek</h1>
            <h2>Verify Your Email</h2>
            <p>We've sent a 6-digit code to {email}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleVerify} className="auth-form">
            <div className="form-group">
              <div className="auth-input">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Didn't receive the code?{" "}
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  className="resend-button"
                  disabled={loading}
                >
                  Resend Code
                </button>
              ) : (
                <span>Resend in {countdown}s</span>
              )}
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

export default VerifyEmail;

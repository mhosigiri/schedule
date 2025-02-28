import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiSun, FiMoon } from "react-icons/fi";
import "./Header.css";

interface HeaderProps {
  onLogout: () => void;
  userName: string | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLogout,
  userName,
  isDarkMode,
  toggleTheme,
}) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className={`header ${isDarkMode ? "dark" : "light"}`}>
      <div className="logo-container">
        <h1>Schedule</h1>
      </div>
      <div className="user-controls">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
        <div className="user-greeting">Hello, {userName || "User"}</div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

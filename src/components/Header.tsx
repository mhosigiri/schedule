import React from "react";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
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
  return (
    <header className="header">
      <div className="logo-container">
        <h1 className="brand-logo">YourWeek</h1>
      </div>
      <div className="user-controls">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
        {userName && <span className="user-name">Hi, {userName}</span>}
        <button className="logout-button" onClick={onLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

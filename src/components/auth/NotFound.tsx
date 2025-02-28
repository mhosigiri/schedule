import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiCalendar } from "react-icons/fi";
import "./NotFound.css";

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-button primary">
            <FiCalendar /> Go to Timeline
          </Link>
          <Link to="/schedule" className="not-found-button">
            <FiHome /> Go to Schedule
          </Link>
        </div>
      </div>

      <div className="not-found-graphics">
        <div className="clock-error">
          <div className="clock-face">
            <div className="clock-hour error"></div>
            <div className="clock-minute error"></div>
            <div className="clock-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

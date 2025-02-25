// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import Firebase initialization FIRST to ensure it runs before any Firebase services are used
import "./firebase/firebase";

// Now import components that use Firebase services
import { AuthProvider } from "./contexts/AuthContext";
import AuthContainer from "./components/auth/AuthContainer";
import WeeklySchedule from "./components/WeeklySchedule";
import { PrivateRoute } from "./components/PrivateRoute";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthContainer
                onAuthSuccess={() => console.log("Authentication successful")}
                defaultIsLogin={true}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <AuthContainer
                onAuthSuccess={() => console.log("Authentication successful")}
                defaultIsLogin={false}
              />
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <WeeklySchedule />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);

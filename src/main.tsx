import WeeklySchedule from "./components/WeeklySchedule";
import AuthContainer from "./components/auth/AuthContainer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

// Internal component that uses the auth hook
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      {currentUser ? (
        <WeeklySchedule />
      ) : (
        <AuthContainer onAuthSuccess={() => {}} />
      )}
    </div>
  );
};

// Main App component that provides the auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

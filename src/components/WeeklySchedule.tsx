import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { scheduleService } from "../services/ScheduleService";
import {
  ScheduleData,
  Activity,
  activityTypes,
  days,
  timeSlots,
  initializeEmptySchedule,
} from "../types/schedule";
import "./WeeklySchedule.css";
import { FiCalendar, FiGrid } from "react-icons/fi";
import Header from "./Header";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
});

const WeeklySchedule: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData>(
    initializeEmptySchedule()
  );
  const [selectedActivity, setSelectedActivity] = useState<string>("work");
  const [activityDescription, setActivityDescription] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCells, setSelectedCells] = useState<
    { day: string; time: string }[]
  >([]);

  // Load and subscribe to schedule data from Realtime Database
  useEffect(() => {
    if (!currentUser) {
      console.log("No user found");
      setIsLoading(false);
      return;
    }

    const loadSchedule = async () => {
      console.log("Loading schedule for user:", currentUser.uid);
      try {
        const data = await scheduleService.getSchedule(currentUser.uid);
        console.log("Loaded schedule:", data);
        setSchedule(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        setIsLoading(false);
      }
    };

    loadSchedule();

    // Subscribe to real-time updates
    const unsubscribe = scheduleService.subscribeToSchedule(
      currentUser.uid,
      (data) => {
        if (data) {
          setSchedule(data);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await scheduleService.testConnection();
        console.log("Database connected:", isConnected);
      } catch (error) {
        console.error("Connection test failed:", error);
      }
    };

    checkConnection();
  }, []);

  // Save schedule to Realtime Database
  const saveSchedule = async () => {
    if (!currentUser) {
      console.error("No user found");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving schedule...");
      console.log("Current user:", currentUser.uid);
      console.log("Schedule data:", schedule);

      await scheduleService.saveSchedule(currentUser.uid, schedule);
      console.log("Schedule saved successfully");
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setIsSaving(false);
      alert("Failed to save schedule. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleCellClick = (day: string, time: string) => {
    const cellIndex = selectedCells.findIndex(
      (cell) => cell.day === day && cell.time === time
    );

    if (cellIndex >= 0) {
      // If cell is already selected, unselect it
      setSelectedCells((cells) => cells.filter((_, i) => i !== cellIndex));
    } else {
      // Add cell to selection if it's in the same column as other selected cells
      const canSelect =
        selectedCells.length === 0 ||
        selectedCells.every((cell) => cell.day === day);

      if (canSelect) {
        setSelectedCells((cells) => [...cells, { day, time }]);
      }
    }
  };

  const handleAddActivity = async () => {
    console.log("Adding activity...");
    console.log("Selected cells:", selectedCells);
    console.log("Selected activity:", selectedActivity);
    console.log("Description:", activityDescription);

    if (selectedCells.length === 0) {
      console.log("No cells selected");
      return;
    }

    const newSchedule = { ...schedule };
    const activityId = `${Date.now()}`;

    selectedCells.forEach(({ day, time }) => {
      newSchedule[day][time] = {
        id: activityId,
        type: selectedActivity,
        description: activityDescription,
        isActive: true,
      };
    });

    try {
      setIsSaving(true);
      // First save to database
      await scheduleService.saveSchedule(currentUser!.uid, newSchedule);
      // Then update local state
      setSchedule(newSchedule);
      setIsEditing(false);
      setSelectedCells([]);
    } catch (error) {
      console.error("Failed to save activity:", error);
      alert("Failed to save activity. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveActivity = () => {
    const newSchedule = { ...schedule };

    selectedCells.forEach(({ day, time }) => {
      newSchedule[day][time] = null;
    });

    setSchedule(newSchedule);
    setIsEditing(false);
    setSelectedCells([]);
  };

  const getActivityColor = (activity: Activity | null) => {
    if (!activity) return "";
    const activityType = activityTypes.find(
      (type) => type.id === activity.type
    );
    return activityType ? activityType.color : "";
  };

  const getActivityIcon = (activity: Activity | null) => {
    if (!activity) return null;
    const activityType = activityTypes.find(
      (type) => type.id === activity.type
    );
    if (!activityType) return null;

    const Icon = activityType.icon;
    return typeof Icon === "string" ? Icon : <Icon />;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isCellSelected = (day: string, time: string) => {
    return selectedCells.some((cell) => cell.day === day && cell.time === time);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view your schedule.</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div
        className={`weekly-schedule-container ${isDarkMode ? "dark" : "light"}`}
      >
        <Header
          onLogout={handleLogout}
          userName={currentUser?.displayName || null}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <div className="navigation-tabs">
          <Link to="/" className="tab">
            <FiCalendar /> Timeline
          </Link>
          <Link to="/schedule" className="tab active">
            <FiGrid /> Schedule
          </Link>
        </div>

        <div className="schedule-actions">
          <button
            className="save-button"
            onClick={saveSchedule}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Schedule"}
          </button>
          {selectedCells.length > 0 && (
            <button
              className="edit-selection-button"
              onClick={() => setIsEditing(true)}
            >
              Add Activity ({selectedCells.length} selected)
            </button>
          )}
        </div>

        <div className="schedule-content">
          <div className="schedule-grid-container">
            <div className="time-header">Time</div>
            {days.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}

            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                <div className="time-slot">{time}</div>
                {days.map((day) => {
                  const activity = schedule[day][time];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`schedule-cell ${
                        activity ? "active-cell" : ""
                      } ${isCellSelected(day, time) ? "selected-cell" : ""}`}
                      style={{
                        backgroundColor: activity
                          ? getActivityColor(activity)
                          : "",
                      }}
                      onClick={() => handleCellClick(day, time)}
                    >
                      {activity && (
                        <>
                          <div className="activity-icon">
                            {getActivityIcon(activity)}
                          </div>
                          <div className="activity-description">
                            {activity.description}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="activity-modal">
            <div className="activity-form">
              <h2>
                {selectedCells.length} time slot
                {selectedCells.length > 1 ? "s" : ""} selected
              </h2>

              <div className="activity-types">
                {activityTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`activity-type ${
                      selectedActivity === type.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedActivity(type.id)}
                  >
                    <div className="activity-icon">
                      {typeof type.icon === "string" ? (
                        type.icon
                      ) : (
                        <type.icon />
                      )}
                    </div>
                    <div>{type.name}</div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Enter activity description"
                />
              </div>

              <div className="form-actions">
                <button onClick={handleAddActivity} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Activity"}
                </button>
                <button onClick={handleRemoveActivity} className="remove-btn">
                  Remove
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default WeeklySchedule;

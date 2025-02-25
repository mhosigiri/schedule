import React, { useState, useEffect } from "react";
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

interface HeaderProps {
  onLogout: () => void;
  userName: string | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, userName }) => {
  return (
    <header className="header">
      <div className="logo-container">
        <div className="traffic-light">
          <div className="light red"></div>
          <div className="light yellow"></div>
          <div className="light green"></div>
        </div>
        <h1>Interactive Weekly Schedule</h1>
      </div>
      <div className="user-controls">
        <div className="user-greeting">Hello, {userName || "User"}</div>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

const WeeklySchedule: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData>(
    initializeEmptySchedule()
  );
  const [selectedDay, setSelectedDay] = useState<string>(days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string>("work");
  const [activityDescription, setActivityDescription] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load and subscribe to schedule data from Realtime Database
  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    const loadSchedule = async () => {
      try {
        const data = await scheduleService.getSchedule(currentUser.uid);
        if (data) {
          setSchedule(data);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
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

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Save schedule to Realtime Database
  const saveSchedule = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await scheduleService.saveSchedule(currentUser.uid, schedule);
      setIsSaving(false);
      alert("Schedule saved successfully!");
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
    setSelectedDay(day);
    setSelectedTime(time);

    const currentActivity = schedule[day][time];
    if (currentActivity) {
      setSelectedActivity(currentActivity.type);
      setActivityDescription(currentActivity.description);
    } else {
      setSelectedActivity("work");
      setActivityDescription("");
    }

    setIsEditing(true);
  };

  const handleAddActivity = () => {
    if (!selectedDay || !selectedTime) return;

    const newSchedule = { ...schedule };
    const activityId = `${selectedDay}-${selectedTime}-${Date.now()}`;

    newSchedule[selectedDay][selectedTime] = {
      id: activityId,
      type: selectedActivity,
      description: activityDescription,
      isActive: true,
    };

    setSchedule(newSchedule);
    setIsEditing(false);
  };

  const handleRemoveActivity = () => {
    if (!selectedDay || !selectedTime) return;

    const newSchedule = { ...schedule };
    newSchedule[selectedDay][selectedTime] = null;

    setSchedule(newSchedule);
    setIsEditing(false);
  };

  const getActivityColor = (activity: Activity | null) => {
    if (!activity) return "";
    const activityType = activityTypes.find(
      (type) => type.id === activity.type
    );
    return activityType ? activityType.color : "";
  };

  const getActivityIcon = (activity: Activity | null) => {
    if (!activity) return "";
    const activityType = activityTypes.find(
      (type) => type.id === activity.type
    );
    return activityType ? activityType.icon : "";
  };

  return (
    <div className="weekly-schedule-container">
      <Header
        onLogout={handleLogout}
        userName={currentUser?.displayName || null}
      />
      <div className="schedule-actions">
        <button
          className="save-button"
          onClick={saveSchedule}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Schedule"}
        </button>
      </div>

      <div className="schedule-content">
        <div className="graphics-sidebar">
          <div className="car-container">
            <div className="car">
              <div className="car-top"></div>
              <div className="car-body"></div>
              <div className="car-wheel wheel-left"></div>
              <div className="car-wheel wheel-right"></div>
            </div>
            <div className="road"></div>
          </div>

          <div className="books-stack">
            <div className="book book1"></div>
            <div className="book book2"></div>
            <div className="book book3"></div>
          </div>

          <div className="clock">
            <div className="clock-face">
              <div className="clock-hour"></div>
              <div className="clock-minute"></div>
              <div className="clock-center"></div>
            </div>
          </div>
        </div>

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
                    className={`schedule-cell ${activity ? "active-cell" : ""}`}
                    style={{
                      backgroundColor: activity
                        ? getActivityColor(activity)
                        : "",
                      boxShadow: activity
                        ? `0 0 10px ${getActivityColor(
                            activity
                          )}, 0 0 20px ${getActivityColor(activity)}`
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
              {selectedTime} on {selectedDay}
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
                  <div className="activity-icon">{type.icon}</div>
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
              <button onClick={handleAddActivity}>Save Activity</button>
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
  );
};

export default WeeklySchedule;

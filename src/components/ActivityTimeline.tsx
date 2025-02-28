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
} from "../types/schedule";
import { FiSun, FiMoon, FiCalendar, FiGrid } from "react-icons/fi";
import "./ActivityTimeline.css";
import Header from "./Header";

interface ActivityEvent {
  id: string;
  day: string;
  time: string;
  type: string;
  description: string;
  color: string;
  icon: any;
  date: Date;
}

const ActivityTimeline: React.FC = () => {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Load schedule data
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const loadSchedule = async () => {
      try {
        const data = await scheduleService.getSchedule(currentUser.uid);
        setSchedule(data);
        processActivities(data);
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
          processActivities(data);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Process schedule data into a list of activities
  const processActivities = (scheduleData: ScheduleData) => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const dayMapping: { [key: number]: string } = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const allActivities: ActivityEvent[] = [];

    // Get start of current week (Monday)
    const startOfWeek = new Date(today);
    const daysFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Process each day's activities
    Object.entries(scheduleData).forEach(([day, daySchedule]) => {
      const dayOffset = days.indexOf(day);

      Object.entries(daySchedule).forEach(([time, activity]) => {
        if (!activity) return;

        // Create date for this activity
        const [hourStr, minuteStr, period] =
          time.match(/(\d+):(\d+)\s(AM|PM)/)?.slice(1) || [];
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        if (period === "PM" && hour !== 12) {
          hour += 12;
        } else if (period === "AM" && hour === 12) {
          hour = 0;
        }

        const activityDate = new Date(startOfWeek);
        activityDate.setDate(startOfWeek.getDate() + dayOffset);
        activityDate.setHours(hour, minute, 0, 0);

        const activityType = activityTypes.find(
          (type) => type.id === activity.type
        );

        if (activityType) {
          allActivities.push({
            id: activity.id,
            day,
            time,
            type: activity.type,
            description: activity.description,
            color: activityType.color,
            icon: activityType.icon,
            date: activityDate,
          });
        }
      });
    });

    // Sort activities chronologically
    allActivities.sort((a, b) => a.date.getTime() - b.date.getTime());
    setActivities(allActivities);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const diffInMinutes = Math.round(diff / 60000);
    const diffInHours = Math.round(diff / 3600000);
    const diffInDays = Math.round(diff / (3600000 * 24));

    if (diff < 0) {
      // Past events
      if (diffInMinutes > -60) {
        return `${Math.abs(diffInMinutes)} minute${
          Math.abs(diffInMinutes) !== 1 ? "s" : ""
        } ago`;
      } else if (diffInHours > -24) {
        return `${Math.abs(diffInHours)} hour${
          Math.abs(diffInHours) !== 1 ? "s" : ""
        } ago`;
      } else if (diffInDays > -7) {
        return `${Math.abs(diffInDays)} day${
          Math.abs(diffInDays) !== 1 ? "s" : ""
        } ago`;
      }
    } else {
      // Future events
      if (diffInMinutes < 60) {
        return `in ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
      } else if (diffInHours < 24) {
        return `in ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
      } else if (diffInDays < 7) {
        return `in ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`;
      }
    }

    // Default format for events further away
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (activity: ActivityEvent) => {
    const Icon = activity.icon;
    return typeof Icon === "string" ? Icon : <Icon />;
  };

  if (isLoading) {
    return <div className="loading-screen">Loading your activities...</div>;
  }

  if (!currentUser) {
    return (
      <div className="login-prompt">Please log in to view your activities.</div>
    );
  }

  return (
    <div
      className={`activity-timeline-container ${isDarkMode ? "dark" : "light"}`}
    >
      <Header
        onLogout={() => {}}
        userName={currentUser?.displayName || null}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="navigation-tabs">
        <Link to="/" className="tab active">
          <FiCalendar /> Timeline
        </Link>
        <Link to="/schedule" className="tab">
          <FiGrid /> Schedule
        </Link>
      </div>

      <div className="timeline-container">
        <div className="timeline-header">
          <h2>Your Activities</h2>
          <p className="current-time">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="timeline">
          {activities.length === 0 ? (
            <div className="no-activities">
              <p>No activities scheduled yet.</p>
              <Link to="/schedule" className="add-activity-link">
                Add your first activity
              </Link>
            </div>
          ) : (
            activities.map((activity, index) => {
              const isPast = activity.date < currentTime;
              const isNow =
                Math.abs(activity.date.getTime() - currentTime.getTime()) <
                1800000; // Within 30 minutes

              return (
                <div
                  key={`${activity.id}-${index}`}
                  className={`timeline-item ${isPast ? "past" : "future"} ${
                    isNow ? "current" : ""
                  }`}
                >
                  <div
                    className="timeline-dot"
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <div
                    className="timeline-content"
                    style={{ borderColor: activity.color }}
                  >
                    <div className="activity-time">
                      <div className="activity-day">{activity.day}</div>
                      <div className="activity-hour">{activity.time}</div>
                      <div className="relative-time">
                        {formatRelativeTime(activity.date)}
                      </div>
                    </div>

                    <div className="activity-details">
                      <div
                        className="activity-type-icon"
                        style={{ color: activity.color }}
                      >
                        {getActivityIcon(activity)}
                      </div>
                      <div className="activity-info">
                        <h3>
                          {
                            activityTypes.find(
                              (type) => type.id === activity.type
                            )?.name
                          }
                        </h3>
                        <p>{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { scheduleService } from "../services/ScheduleService";
import { ScheduleData, activityTypes, days } from "../types/schedule";
import { FiCalendar, FiGrid } from "react-icons/fi";
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
  isRecurring: boolean;
  duration: number;
  days: string[];
  groupId?: string;
}

const ActivityTimeline: React.FC = () => {
  const { currentUser } = useAuth();
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
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    const dayIndex = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Create a map to track activity metadata by ID or groupId
    const activityMetaMap: { [key: string]: ActivityEvent } = {};

    // Map to track day-specific activities
    // The key format is "day-groupId" or "day-id" if no groupId
    const dayActivityMap: { [key: string]: ActivityEvent } = {};

    // Get start of current week (Monday)
    const startOfWeek = new Date(today);
    const daysFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Process each day's activities
    Object.entries(scheduleData).forEach(([day, daySchedule]) => {
      const dayOffset = days.indexOf(day);

      // First, sort the time slots to ensure we process them in order
      const sortedTimeSlots = Object.keys(daySchedule).sort((a, b) => {
        const timeA = a.match(/(\d+):(\d+)\s(AM|PM)/);
        const timeB = b.match(/(\d+):(\d+)\s(AM|PM)/);
        if (!timeA || !timeB) return 0;

        let hourA = parseInt(timeA[1]);
        let hourB = parseInt(timeB[1]);

        // Convert to 24-hour format for comparison
        if (timeA[3] === "PM" && hourA !== 12) hourA += 12;
        if (timeA[3] === "AM" && hourA === 12) hourA = 0;
        if (timeB[3] === "PM" && hourB !== 12) hourB += 12;
        if (timeB[3] === "AM" && hourB === 12) hourB = 0;

        if (hourA !== hourB) return hourA - hourB;
        return parseInt(timeA[2]) - parseInt(timeB[2]);
      });

      sortedTimeSlots.forEach((time) => {
        const activity = daySchedule[time];
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

        if (!activityType) return;

        // Use groupId for metadata tracking if available, otherwise use id
        const mapKey = activity.groupId || activity.id;

        // Create a key for tracking this activity on this specific day
        const dayActivityKey = `${day}-${mapKey}`;

        // Check if we already have this activity started on this day
        if (dayActivityMap[dayActivityKey]) {
          // This is a continuation of an activity on the same day
          // Increase the duration
          dayActivityMap[dayActivityKey].duration += 1;
        } else {
          // This is a new activity instance for this day
          const activityInstance: ActivityEvent = {
            id: activity.id,
            day,
            time,
            type: activity.type,
            description: activity.description,
            color: activityType.color,
            icon: activityType.icon,
            date: new Date(activityDate), // Clone the date
            isRecurring: activity.isRecurring,
            duration: 1,
            days: [day],
            groupId: activity.groupId,
          };

          // Add to day-specific map
          dayActivityMap[dayActivityKey] = activityInstance;
        }

        // Track metadata for this group of activities
        if (
          !activityMetaMap[mapKey] ||
          activityMetaMap[mapKey].date > activityDate
        ) {
          // This is the earliest instance of this activity group
          const metadataInstance = {
            id: activity.id,
            day,
            time,
            type: activity.type,
            description: activity.description,
            color: activityType.color,
            icon: activityType.icon,
            date: new Date(activityDate), // Clone the date
            isRecurring: activity.isRecurring,
            duration: 1,
            days: [day],
            groupId: activity.groupId,
          };

          activityMetaMap[mapKey] = metadataInstance;
        }

        // If we already have metadata for this activity group, update the days array
        if (
          activityMetaMap[mapKey] &&
          !activityMetaMap[mapKey].days.includes(day)
        ) {
          activityMetaMap[mapKey].days.push(day);
        }
      });
    });

    // Filter out past activities (activities from earlier today are kept)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Calculate the end date (today + 7 days)
    const endDate = new Date(todayStart);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    // Create a new array for all activities for the next week
    let activitiesForNextWeek: ActivityEvent[] = [];

    // Process day-specific activities
    Object.values(dayActivityMap).forEach((activity) => {
      // If the activity is not recurring, just add it if it's in range
      if (!activity.isRecurring) {
        if (activity.date >= todayStart && activity.date <= endDate) {
          // If this activity is part of a group, copy over the days array from metadata
          if (activity.groupId) {
            const mapKey = activity.groupId;
            activity.days = [...activityMetaMap[mapKey].days];
          }
          activitiesForNextWeek.push(activity);
        }
      } else {
        // For recurring activities, we'll handle them separately
        // We don't need to do anything here as we'll create recurring instances below
      }
    });

    // Process recurring activities
    Object.values(dayActivityMap).forEach((activity) => {
      if (!activity.isRecurring) return; // Skip non-recurring activities

      // Get the day of week for this activity (0-6, where 0 is Sunday)
      const activityDayIndex = days.indexOf(activity.day);
      const activityDayOfWeek =
        activityDayIndex === 6 ? 0 : activityDayIndex + 1;

      // For each day in the next 7 days
      for (let i = 0; i < 7; i++) {
        const nextDate = new Date(todayStart);
        nextDate.setDate(todayStart.getDate() + i);

        // If this day matches the recurring activity's day of week
        if (nextDate.getDay() === activityDayOfWeek) {
          // Create a new instance of the activity for this date
          const [hourStr, minuteStr, period] =
            activity.time.match(/(\d+):(\d+)\s(AM|PM)/)?.slice(1) || [];
          let hour = parseInt(hourStr);
          const minute = parseInt(minuteStr);

          if (period === "PM" && hour !== 12) {
            hour += 12;
          } else if (period === "AM" && hour === 12) {
            hour = 0;
          }

          // Set the time for this instance
          nextDate.setHours(hour, minute, 0, 0);

          // Only add if it's in the future or today
          if (nextDate >= todayStart) {
            // Copy days array from metadata if this is part of a group
            const newActivity = {
              ...activity,
              date: new Date(nextDate),
              id: `${activity.id}-${nextDate.toISOString()}`,
            };

            if (activity.groupId) {
              const mapKey = activity.groupId;
              newActivity.days = [...activityMetaMap[mapKey].days];
            }

            activitiesForNextWeek.push(newActivity);
          }
        }
      }
    });

    // Sort chronologically
    activitiesForNextWeek.sort((a, b) => a.date.getTime() - b.date.getTime());

    setActivities(activitiesForNextWeek);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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
          <h2>Next 7 Days</h2>
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
              <p>No upcoming activities scheduled.</p>
              <Link to="/schedule" className="add-activity-link">
                Add an activity
              </Link>
            </div>
          ) : (
            (() => {
              // Group activities by date
              const groupedActivities: { [date: string]: ActivityEvent[] } = {};

              activities.forEach((activity) => {
                const dateStr = activity.date.toDateString();
                if (!groupedActivities[dateStr]) {
                  groupedActivities[dateStr] = [];
                }
                groupedActivities[dateStr].push(activity);
              });

              // Convert to array of [dateStr, activities] pairs and sort by date
              return Object.entries(groupedActivities)
                .sort(([dateStrA], [dateStrB]) => {
                  return (
                    new Date(dateStrA).getTime() - new Date(dateStrB).getTime()
                  );
                })
                .map(([dateStr, dayActivities]) => {
                  const activityDate = new Date(dateStr);
                  const isToday =
                    activityDate.toDateString() === new Date().toDateString();

                  // Format the date for the separator
                  const formattedDate = activityDate.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  return (
                    <React.Fragment key={dateStr}>
                      <div className="date-separator">
                        {isToday ? "Today" : formattedDate}
                      </div>

                      {dayActivities.map((activity, index) => (
                        <div
                          key={`${activity.id}-${index}`}
                          className={`timeline-item compact ${
                            isToday ? "current-day" : "future"
                          }`}
                        >
                          <div
                            className="timeline-dot"
                            style={{ backgroundColor: activity.color }}
                          ></div>
                          <div className="timeline-content compact">
                            <div className="activity-header">
                              <div className="activity-icon">
                                {getActivityIcon(activity)}
                              </div>
                              <div className="activity-info">
                                <h3 className="activity-type">
                                  {
                                    activityTypes.find(
                                      (type) => type.id === activity.type
                                    )?.name
                                  }
                                  {activity.isRecurring && (
                                    <span className="recurring-badge">
                                      Weekly
                                    </span>
                                  )}
                                </h3>
                                <p className="activity-time">
                                  {activity.time}
                                  {activity.duration > 1 && (
                                    <span className="duration-text">
                                      {" "}
                                      ({activity.duration * 30} mins)
                                    </span>
                                  )}
                                </p>
                                {activity.description && (
                                  <p className="activity-description">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  );
                });
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;

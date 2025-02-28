// src/services/ScheduleService.ts
import { database } from '../firebase';
import { ref, onValue, set, get, DataSnapshot, Unsubscribe } from 'firebase/database';
import { initializeEmptySchedule, ScheduleData } from '../types/schedule';

class ScheduleService {
  // Add error handling for malformed data
  async getSchedule(userId: string): Promise<ScheduleData> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const scheduleRef = ref(database, `schedules/${userId}`);
      const snapshot = await get(scheduleRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure data has proper structure
        return { ...initializeEmptySchedule(), ...data };
      } else {
        // Only initialize empty schedule if no data exists
        const emptySchedule = initializeEmptySchedule();
        await this.saveSchedule(userId, emptySchedule);
        return emptySchedule;
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  }

  // Add data validation to subscription
  subscribeToSchedule(userId: string, callback: (data: ScheduleData) => void): Unsubscribe {
    if (!userId) {
      console.error("User ID is required for subscription");
      return () => {};
    }

    const scheduleRef = ref(database, `schedules/${userId}`);
    
    const unsubscribe = onValue(scheduleRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure data has proper structure
        const schedule = { ...initializeEmptySchedule(), ...data };
        callback(schedule);
      } else {
        callback(initializeEmptySchedule());
      }
    }, (error) => {
      console.error("Error in schedule subscription:", error);
      callback(initializeEmptySchedule());
    });

    return unsubscribe;
  }

  // Add validation to save operation
  async saveSchedule(userId: string, scheduleData: ScheduleData): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log("Attempting to save schedule for user:", userId);
      
      // Create the reference
      const scheduleRef = ref(database, `schedules/${userId}`);
      
      // Attempt to save
      await set(scheduleRef, scheduleData);
      console.log("Schedule saved successfully to path:", `schedules/${userId}`);
      return true;
    } catch (error) {
      console.error("Error in saveSchedule:", error);
      // Add specific error handling
      if (error instanceof Error) {
        if (error.message.includes("permission_denied")) {
          console.error("Permission denied. Check database rules.");
        } else if (error.message.includes("network")) {
          console.error("Network error. Check your connection.");
        }
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  // Add database connection test
  async testConnection(): Promise<boolean> {
    try {
      const testRef = ref(database, 'schedules');
      await get(testRef);
      console.log("Database connection test successful");
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
}

export const scheduleService = new ScheduleService();
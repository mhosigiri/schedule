// src/services/ScheduleService.ts
import { database } from '../firebase/firebase';
import { ref, set, get, onValue, DatabaseReference } from 'firebase/database';
import { ScheduleData } from '../types/schedule';

export class ScheduleService {
  private getUserScheduleRef(userId: string): DatabaseReference {
    return ref(database, `schedules/${userId}`);
  }

  // Save a user's schedule to the database
  async saveSchedule(userId: string, schedule: ScheduleData): Promise<void> {
    try {
      const scheduleRef = this.getUserScheduleRef(userId);
      await set(scheduleRef, schedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  // Get a user's schedule once
  async getSchedule(userId: string): Promise<ScheduleData | null> {
    try {
      const scheduleRef = this.getUserScheduleRef(userId);
      const snapshot = await get(scheduleRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as ScheduleData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting schedule:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates to a user's schedule
  subscribeToSchedule(userId: string, callback: (schedule: ScheduleData | null) => void): () => void {
    const scheduleRef = this.getUserScheduleRef(userId);
    
    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as ScheduleData);
      } else {
        callback(null);
      }
    });
    
    // Return the unsubscribe function to be called when no longer needed
    return unsubscribe;
  }
}

export const scheduleService = new ScheduleService();
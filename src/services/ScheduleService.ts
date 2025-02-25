// src/services/ScheduleService.ts
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Import the pre-initialized firestore
import { ScheduleData, initializeEmptySchedule } from '../types/schedule';

class ScheduleService {
  /**
   * Save schedule to Firestore
   */
  async saveSchedule(userId: string, scheduleData: ScheduleData): Promise<void> {
    try {
      // Save to Firestore using the imported firestore instance
      const docRef = doc(firestore, 'schedules', userId);
      await setDoc(docRef, { 
        data: scheduleData,
        updatedAt: new Date().toISOString() 
      });
      console.log("Schedule successfully saved to Firestore");
      return Promise.resolve();
    } catch (error) {
      console.error("Error saving schedule:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Get schedule from Firestore
   */
  async getSchedule(userId: string): Promise<ScheduleData | null> {
    try {
      // Try to get from Firestore using the imported firestore instance
      const docRef = doc(firestore, 'schedules', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.data as ScheduleData;
      } else {
        console.log("No schedule found for user, initializing empty schedule");
        return initializeEmptySchedule();
      }
    } catch (error) {
      console.error("Error getting schedule:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Subscribe to schedule updates from Firestore
   */
  subscribeToSchedule(userId: string, callback: (data: ScheduleData | null) => void) {
    // Subscribe to Firestore updates using the imported firestore instance
    const docRef = doc(firestore, 'schedules', userId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.data as ScheduleData);
      } else {
        callback(initializeEmptySchedule());
      }
    }, (error) => {
      console.error("Error in schedule subscription:", error);
      callback(null);
    });

    return unsubscribe;
  }
}

export const scheduleService = new ScheduleService();
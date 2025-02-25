// src/types/schedule.ts

export interface Activity {
    id: string;
    type: string;
    description: string;
    isActive: boolean;
  }
  
  export interface DaySchedule {
    [timeSlot: string]: Activity | null;
  }
  
  export interface ScheduleData {
    [day: string]: DaySchedule;
  }
  
  export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  export const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM'
  ];
  
  export const activityTypes = [
    { id: 'work', name: 'Work', icon: '💼', color: '#4285F4' },
    { id: 'study', name: 'Study', icon: '📚', color: '#34A853' },
    { id: 'exercise', name: 'Exercise', icon: '🏋️', color: '#FBBC05' },
    { id: 'leisure', name: 'Leisure', icon: '🎮', color: '#EA4335' },
    { id: 'family', name: 'Family', icon: '👪', color: '#9C27B0' },
    { id: 'meal', name: 'Meal', icon: '🍽️', color: '#FF9800' },
    { id: 'sleep', name: 'Sleep', icon: '😴', color: '#607D8B' },
    { id: 'other', name: 'Other', icon: '🔄', color: '#795548' }
  ];
  
  export const initializeEmptySchedule = (): ScheduleData => {
    const emptySchedule: ScheduleData = {};
    
    days.forEach(day => {
      emptySchedule[day] = {};
      timeSlots.forEach(time => {
        emptySchedule[day][time] = null;
      });
    });
    
    return emptySchedule;
  };
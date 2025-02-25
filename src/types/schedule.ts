// src/types/schedule.ts

export type Activity = {
    id: string;
    type: string;
    description: string;
    isActive: boolean;
  };
  
  export type ScheduleData = {
    [day: string]: {
      [timeSlot: string]: Activity | null;
    };
  };
  
  export const activityTypes = [
    { id: 'work', name: 'Work', icon: '🏢', color: '#ff00ff' },
    { id: 'study', name: 'Study', icon: '📚', color: '#00ffff' },
    { id: 'exercise', name: 'Exercise', icon: '🏋️', color: '#ffff00' },
    { id: 'meal', name: 'Meal', icon: '🍽️', color: '#ff7700' },
    { id: 'commute', name: 'Commute', icon: '🚗', color: '#ff0077' },
    { id: 'leisure', name: 'Leisure', icon: '🎮', color: '#00ff77' },
    { id: 'sleep', name: 'Sleep', icon: '😴', color: '#0077ff' },
    { id: 'other', name: 'Other', icon: '📌', color: '#7700ff' },
  ];
  
  export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  export const generateTimeSlots = () => {
    const slots = [];
    for (let i = 7; i <= 21; i++) {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      slots.push(`${hour}:00 ${ampm}`);
      slots.push(`${hour}:30 ${ampm}`);
    }
    return slots;
  };
  
  export const timeSlots = generateTimeSlots();
  
  export const initializeEmptySchedule = (): ScheduleData => {
    const schedule: ScheduleData = {};
    days.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(timeSlot => {
        schedule[day][timeSlot] = null;
      });
    });
    return schedule;
  };
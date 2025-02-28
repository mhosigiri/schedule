// src/types/schedule.ts

import type { IconType } from 'react-icons';
import { 
  FiBriefcase, 
  FiBook, 
  FiCoffee, 
  FiHeart, 
  FiMusic 
} from 'react-icons/fi';

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
  [day: string]: {
    [time: string]: Activity | null;
  };
}

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM'
];

// Add an interface for activity types
interface ActivityType {
  id: string;
  name: string;
  icon: IconType | string;
  color: string;
}

export const activityTypes: ActivityType[] = [
  { id: 'work', name: 'Work', icon: FiBriefcase, color: '#4A90E2' },
  { id: 'study', name: 'Study', icon: FiBook, color: '#50E3C2' },
  { id: 'break', name: 'Break', icon: FiCoffee, color: '#F5A623' },
  { id: 'exercise', name: 'Exercise', icon: FiHeart, color: '#FF5A5F' },
  { id: 'leisure', name: 'Leisure', icon: FiMusic, color: '#BD10E0' },
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
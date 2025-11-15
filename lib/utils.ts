import { Task, Note, PomodoroSettings } from './types';

const STORAGE_KEYS = {
  TASKS: 'productivity-dashboard-tasks',
  NOTES: 'productivity-dashboard-notes',
  POMODORO: 'productivity-dashboard-pomodoro',
};

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  },
  
  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
  
  // Notes
  getNotes: (): Note[] => {
    if (typeof window === 'undefined') return [];
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : [];
  },
  
  saveNotes: (notes: Note[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },
  
  // Pomodoro
  getPomodoroSettings: (): PomodoroSettings => {
    if (typeof window === 'undefined') {
      return {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
      };
    }
    const settings = localStorage.getItem(STORAGE_KEYS.POMODORO);
    return settings ? JSON.parse(settings) : {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
    };
  },
  
  savePomodoroSettings: (settings: PomodoroSettings): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(settings));
  },
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

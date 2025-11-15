export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'urgent' | 'other';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

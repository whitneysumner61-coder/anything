'use client';

import React, { useState, useEffect } from 'react';
import { storage, formatTime } from '@/lib/utils';
import { PomodoroSettings } from '@/lib/types';

type TimerMode = 'work' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedSettings = storage.getPomodoroSettings();
    setSettings(savedSettings);
    setTimeLeft(savedSettings.workDuration * 60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('break');
        setTimeLeft(settings.breakDuration * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }

    // Play a notification sound (browser notification)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Pomodoro Timer', {
            body: mode === 'work' ? 'Time for a break!' : 'Time to work!',
          });
        }
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(settings.workDuration * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const saveSettings = () => {
    storage.savePomodoroSettings(settings);
    setShowSettings(false);
    resetTimer();
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'bg-red-500';
      case 'break':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'work':
        return 'Work Session';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Pomodoro Timer</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-2 rounded-full text-white ${getModeColor()} mb-4`}>
            {getModeText()}
          </div>
          <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Sessions completed: {sessionsCompleted}
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-md font-semibold ${
              isRunning
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold"
          >
            Reset
          </button>
          <button
            onClick={skipTimer}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
          >
            Skip
          </button>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>

        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
            <h3 className="font-semibold mb-3">Timer Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Work Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.workDuration}
                  onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Short Break (minutes)</label>
                <input
                  type="number"
                  value={settings.breakDuration}
                  onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Long Break (minutes)</label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Sessions Until Long Break</label>
                <input
                  type="number"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="1"
                  max="10"
                />
              </div>
              <button
                onClick={saveSettings}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

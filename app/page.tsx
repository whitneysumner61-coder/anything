'use client';

import { useState } from 'react';
import TaskManager from '@/components/TaskManager';
import PomodoroTimer from '@/components/PomodoroTimer';
import NoteTaking from '@/components/NoteTaking';

type Tab = 'tasks' | 'pomodoro' | 'notes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Productivity Dashboard
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Manage your tasks, focus with Pomodoro, and take notes
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📝 Tasks
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'pomodoro'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⏱️ Pomodoro
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📓 Notes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'notes' && <NoteTaking />}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">All data is stored locally in your browser</p>
        </footer>
      </div>
    </main>
  );
}

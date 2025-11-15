'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { storage, generateId } from '@/lib/utils';

export default function NoteTaking() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useEffect(() => {
    setNotes(storage.getNotes());
  }, []);

  useEffect(() => {
    storage.saveNotes(notes);
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditForm({ title: newNote.title, content: newNote.content });
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    setNotes(notes.map(note =>
      note.id === selectedNote.id
        ? {
            ...note,
            title: editForm.title || 'Untitled Note',
            content: editForm.content,
            updatedAt: new Date().toISOString(),
          }
        : note
    ));
    
    setSelectedNote({
      ...selectedNote,
      title: editForm.title || 'Untitled Note',
      content: editForm.content,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setEditForm({ title: note.title, content: note.content });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Notes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Notes List */}
        <div className="md:col-span-1">
          <button
            onClick={createNote}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold mb-4"
          >
            + New Note
          </button>
          
          <div className="space-y-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No notes yet. Create your first note!
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer border ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="md:col-span-2">
          {selectedNote ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="Note title"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-96"
                    placeholder="Write your note here..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveNote}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditForm({ title: selectedNote.title, content: selectedNote.content });
                        setIsEditing(false);
                      }}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{selectedNote.title}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Last updated: {formatDate(selectedNote.updatedAt)}
                  </p>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{selectedNote.content || 'No content yet. Click Edit to add content.'}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg">Select a note to view or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

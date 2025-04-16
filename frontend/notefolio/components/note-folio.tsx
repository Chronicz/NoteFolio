"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import NoteEditor from "./note-editor"
import { FiMenu } from "react-icons/fi"
import type { Note } from "@/types/note"

export default function NoteFolio() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Initialize with a welcome note
  useEffect(() => {
    if (notes.length === 0) {
      const welcomeNote: Note = {
        id: "1",
        title: "Welcome to NoteFolio",
        content: "Start writing your notes here...",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setNotes([welcomeNote])
      setActiveNoteId("1")
    }
  }, [notes.length])

  const activeNote = notes.find((note) => note.id === activeNoteId) || null

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
  }

  const updateNote = (updatedNote: Note) => {
    setNotes(
      notes.map((note) =>
        note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : note,
      ),
    )
  }

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))
    if (activeNoteId === noteId) {
      setActiveNoteId(notes.length > 1 ? notes[0].id : null)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNewNote}
        onDeleteNote={deleteNote}
        isOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-200">
        <header className="h-12 border-b border-gray-200 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 mr-2 text-gray-600"
            aria-label="Toggle sidebar"
          >
            <FiMenu size={18} />
          </button>
          <h1 className="text-lg font-medium">NoteFolio</h1>
        </header>

        <main className="flex-1 overflow-auto">
          {activeNote ? (
            <NoteEditor note={activeNote} onUpdateNote={updateNote} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500">No note selected</p>
                <button onClick={createNewNote} className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
                  Create a new note
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

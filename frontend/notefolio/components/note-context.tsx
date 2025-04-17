"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  htmlContent?: string
}

interface NoteContextType {
  notes: Note[]
  activeNoteId: string
  setActiveNoteId: (id: string) => void
  addNote: () => void
  deleteNote: (id: string) => void
  updateNote: (id: string, data: Partial<Note>) => void
}

const NoteContext = createContext<NoteContextType | undefined>(undefined)

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Hello World",
      content: "Hello class. This is Notefolio",
      timestamp: "03:45 PM",
      htmlContent: "Hello class. This is Notefolio",
    },
    {
      id: "2",
      title: "Untitled Note",
      content: "",
      timestamp: "03:57 PM",
      htmlContent: "",
    },
  ])
  const [activeNoteId, setActiveNoteId] = useState("1")

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      htmlContent: "",
    }
    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNoteId === id && notes.length > 1) {
      setActiveNoteId(notes[0].id === id ? notes[1].id : notes[0].id)
    }
  }

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, ...data } : note)))
  }

  return (
    <NoteContext.Provider
      value={{
        notes,
        activeNoteId,
        setActiveNoteId,
        addNote,
        deleteNote,
        updateNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NoteContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider")
  }
  return context
}

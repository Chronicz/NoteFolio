"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  htmlContent?: string
  tags: string[]
}

interface NoteContextType {
  notes: Note[]
  activeNoteId: string
  setActiveNoteId: (id: string) => void
  addNote: () => void
  deleteNote: (id: string) => void
  updateNote: (id: string, data: Partial<Note>) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchBy: "title" | "tags" | "all"
  setSearchBy: (by: "title" | "tags" | "all") => void
  filteredNotes: Note[]
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
      tags: ["welcome", "intro"],
    },
    {
      id: "2",
      title: "Untitled Note",
      content: "",
      timestamp: "03:57 PM",
      htmlContent: "",
      tags: [],
    },
  ])
  const [activeNoteId, setActiveNoteId] = useState("1")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchBy, setSearchBy] = useState<"title" | "tags" | "all">("all")

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      htmlContent: "",
      tags: [],
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

  const addTag = (id: string, tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag) return

    setNotes(
      notes.map((note) => {
        if (note.id === id && !note.tags.includes(trimmedTag)) {
          return { ...note, tags: [...note.tags, trimmedTag] }
        }
        return note
      }),
    )
  }

  const removeTag = (id: string, tag: string) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, tags: note.tags.filter((t) => t !== tag) }
        }
        return note
      }),
    )
  }

  // Filter notes based on search term and search type
  const filteredNotes = notes.filter((note) => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    if (searchBy === "title") {
      return note.title.toLowerCase().includes(lowerSearchTerm)
    }

    if (searchBy === "tags") {
      return note.tags.some((tag) => tag.includes(lowerSearchTerm))
    }

    // searchBy === "all"
    return note.title.toLowerCase().includes(lowerSearchTerm) || note.tags.some((tag) => tag.includes(lowerSearchTerm))
  })

  return (
    <NoteContext.Provider
      value={{
        notes,
        activeNoteId,
        setActiveNoteId,
        addNote,
        deleteNote,
        updateNote,
        addTag,
        removeTag,
        searchTerm,
        setSearchTerm,
        searchBy,
        setSearchBy,
        filteredNotes,
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

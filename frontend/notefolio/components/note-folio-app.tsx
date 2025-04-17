"use client"

import { useState } from "react"
import NoteSidebar from "./note-sidebar"
import NoteEditor from "./note-editor"
import type { Note } from "@/lib/types"

export default function NoteFolioApp() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Hello World",
      content: "Hello class. This is Notefolio",
      timestamp: "03:45 PM",
    },
    {
      id: "2",
      title: "Untitled Note",
      content: "",
      timestamp: "03:57 PM",
    },
  ])

  const [activeNoteId, setActiveNoteId] = useState("1")

  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0]

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNoteId === id && notes.length > 1) {
      setActiveNoteId(notes[0].id === id ? notes[1].id : notes[0].id)
    }
  }

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
  }

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
  }

  return (
    <div className="flex h-screen">
      <NoteSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onDeleteNote={handleDeleteNote}
        onAddNote={handleAddNote}
      />
      <NoteEditor note={activeNote} onUpdateNote={handleUpdateNote} />
    </div>
  )
}

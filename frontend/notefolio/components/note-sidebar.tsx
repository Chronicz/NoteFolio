"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  timestamp: string
}

export default function Sidebar() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Hello World",
      content: "Hello class. This is Notefolio",
      timestamp: "03:45",
    },
    {
      id: "2",
      title: "Untitled Note",
      content: "",
      timestamp: "03:57",
    },
  ])
  const [activeNoteId, setActiveNoteId] = useState("1")

  const addNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setNotes([...notes, newNote])
  }

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNoteId === id && notes.length > 1) {
      setActiveNoteId(notes[0].id === id ? notes[1].id : notes[0].id)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes</h1>
        <button onClick={addNewNote} className="add-button" aria-label="Add new note">
          <Plus size={20} />
        </button>
      </div>
      <div className="notes-list">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-item ${activeNoteId === note.id ? "active" : ""}`}
            onClick={() => setActiveNoteId(note.id)}
          >
            <div className="note-title">{note.title}</div>
            <div className="note-meta">
              <span className="note-time">{note.timestamp}</span>
              <button className="delete-button" onClick={(e) => deleteNote(note.id, e)} aria-label="Delete note">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

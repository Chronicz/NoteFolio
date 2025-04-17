"use client"

import type React from "react"

import { Trash2 } from "lucide-react"
import { useNotes } from "./note-context"

export default function Sidebar() {
  const { notes, activeNoteId, setActiveNoteId, addNote, deleteNote } = useNotes()

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNote(id)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes</h1>
        <button onClick={addNote} className="add-button" aria-label="Add new note">
          +
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
            <div className="note-time">{note.timestamp}</div>
            <button className="delete-button" onClick={(e) => handleDeleteNote(note.id, e)} aria-label="Delete note">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

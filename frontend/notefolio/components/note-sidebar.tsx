"use client"

import type React from "react"
import { Trash2, Search, X } from "lucide-react"
import { useNotes } from "./note-context"

export default function Sidebar() {
  const {
    filteredNotes,
    activeNoteId,
    setActiveNoteId,
    addNote,
    deleteNote,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
  } = useNotes()

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNote(id)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes</h1>
        <button onClick={addNote} className="add-button" aria-label="Add new note">
          +
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="search-options">
          <label className="search-option">
            <input type="radio" name="searchBy" checked={searchBy === "all"} onChange={() => setSearchBy("all")} />
            <span>All</span>
          </label>
          <label className="search-option">
            <input type="radio" name="searchBy" checked={searchBy === "title"} onChange={() => setSearchBy("title")} />
            <span>Title</span>
          </label>
          <label className="search-option">
            <input type="radio" name="searchBy" checked={searchBy === "tags"} onChange={() => setSearchBy("tags")} />
            <span>Tags</span>
          </label>
        </div>
      </div>

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="no-results">No notes found</div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${activeNoteId === note.id ? "active" : ""}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <div className="note-title">{note.title}</div>
              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="note-tag">
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && <span className="note-tag-more">+{note.tags.length - 2}</span>}
                </div>
              )}
              <div className="note-time">{note.timestamp}</div>
              <button className="delete-button" onClick={(e) => handleDeleteNote(note.id, e)} aria-label="Delete note">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Trash2, Search, X, ChevronRight, ChevronDown, Folder, FolderPlus, File, Plus } from "lucide-react"
import { useNotes, type Note } from "./note-context"

export default function Sidebar() {
  const {
    notes,
    folders,
    filteredNotes,
    activeNoteId,
    activeFolderId,
    setActiveNoteId,
    setActiveFolderId,
    addNote,
    deleteNote,
    addFolder,
    deleteFolder,
    moveNote,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    getNotesInFolder,
    getSubfolders,
  } = useNotes()

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "folder-1": true,
    "folder-2": true,
  })
  const [newFolderName, setNewFolderName] = useState("")
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: "folder" | "note"
    id: string
  } | null>(null)

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

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    })
  }

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName, newFolderParentId)
      setNewFolderName("")
      setIsAddingFolder(false)
    }
  }

  const startAddFolder = (parentId: string | null = null) => {
    setNewFolderParentId(parentId)
    setIsAddingFolder(true)
  }

  const handleContextMenu = (e: React.MouseEvent, type: "folder" | "note", id: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      id,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId)
    closeContextMenu()
  }

  const handleMoveNote = (noteId: string, folderId: string | null) => {
    moveNote(noteId, folderId)
    closeContextMenu()
  }

  const renderFolderTree = (parentId: string | null = null, depth = 0) => {
    const subfolders = getSubfolders(parentId)

    if (subfolders.length === 0 && parentId !== null) {
      return null
    }

    return (
      <div
        className={`folder-tree ${depth > 0 ? "nested" : ""}`}
        style={{ paddingLeft: depth > 0 ? `${depth * 16}px` : "0" }}
      >
        {subfolders.map((folder) => (
          <div key={folder.id} className="folder-container">
            <div
              className={`folder-item ${activeFolderId === folder.id ? "active" : ""}`}
              onClick={() => setActiveFolderId(folder.id)}
              onContextMenu={(e) => handleContextMenu(e, "folder", folder.id)}
            >
              <div className="folder-header">
                <button
                  className="folder-toggle"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(folder.id)
                  }}
                >
                  {expandedFolders[folder.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Folder size={16} className="folder-icon" />
                <span className="folder-name">{folder.name}</span>
                <button
                  className="folder-add"
                  onClick={(e) => {
                    e.stopPropagation()
                    startAddFolder(folder.id)
                  }}
                >
                  <FolderPlus size={14} />
                </button>
              </div>
            </div>

            {expandedFolders[folder.id] && (
              <>
                {renderFolderNotes(folder.id, depth + 1)}
                {renderFolderTree(folder.id, depth + 1)}
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderFolderNotes = (folderId: string, depth = 0) => {
    const folderNotes = getNotesInFolder(folderId)

    if (folderNotes.length === 0) {
      return null
    }

    return (
      <div className="folder-notes" style={{ paddingLeft: `${depth * 8}px` }}>
        {folderNotes.map((note) => renderNote(note))}
      </div>
    )
  }

  const renderNote = (note: Note) => (
    <div
      key={note.id}
      className={`note-item ${activeNoteId === note.id ? "active" : ""}`}
      onClick={() => setActiveNoteId(note.id)}
      onContextMenu={(e) => handleContextMenu(e, "note", note.id)}
    >
      <div className="note-header">
        <File size={14} className="note-icon" />
        <div className="note-title">{note.title}</div>
      </div>
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
  )

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes</h1>
        <div className="sidebar-actions">
          <button onClick={() => startAddFolder(null)} className="action-button" aria-label="Add folder">
            <FolderPlus size={16} />
          </button>
          <button onClick={() => addNote()} className="add-button" aria-label="Add note">
            +
          </button>
        </div>
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

      <div className="sidebar-content">
        {isAddingFolder && (
          <div className="add-folder-form">
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="folder-name-input"
              autoFocus
            />
            <div className="folder-form-actions">
              <button onClick={handleAddFolder} className="folder-form-button confirm">
                Add
              </button>
              <button onClick={() => setIsAddingFolder(false)} className="folder-form-button cancel">
                Cancel
              </button>
            </div>
          </div>
        )}

        {searchTerm ? (
          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="no-results">No notes found</div>
            ) : (
              filteredNotes.map((note) => renderNote(note))
            )}
          </div>
        ) : (
          <div className="folder-view">
            <div
              className={`folder-item ${activeFolderId === null ? "active" : ""}`}
              onClick={() => setActiveFolderId(null)}
            >
              <div className="folder-header">
                <Folder size={16} className="folder-icon" />
                <span className="folder-name">All Notes</span>
                <button
                  className="folder-add"
                  onClick={(e) => {
                    e.stopPropagation()
                    addNote(null)
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {activeFolderId === null && (
              <div className="folder-notes">{getNotesInFolder(null).map((note) => renderNote(note))}</div>
            )}

            {renderFolderTree()}
          </div>
        )}
      </div>

      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={closeContextMenu}>
          {contextMenu.type === "folder" && (
            <>
              <button
                className="context-menu-item"
                onClick={(e) => {
                  e.stopPropagation()
                  addNote(contextMenu.id)
                  closeContextMenu()
                }}
              >
                Add Note
              </button>
              <button
                className="context-menu-item"
                onClick={(e) => {
                  e.stopPropagation()
                  startAddFolder(contextMenu.id)
                  closeContextMenu()
                }}
              >
                Add Subfolder
              </button>
              <button
                className="context-menu-item delete"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFolder(contextMenu.id)
                }}
              >
                Delete Folder
              </button>
            </>
          )}
          {contextMenu.type === "note" && (
            <>
              <div className="context-menu-section">Move to folder</div>
              <button
                className="context-menu-item"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMoveNote(contextMenu.id, null)
                }}
              >
                Root
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className="context-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMoveNote(contextMenu.id, folder.id)
                  }}
                >
                  {folder.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {contextMenu && <div className="context-menu-backdrop" onClick={closeContextMenu} />}
    </div>
  )
}

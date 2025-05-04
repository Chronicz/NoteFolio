"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  ImageIcon,
  FileText,
  AlignLeft,
  List,
  ListOrdered,
  Menu,
  Bold,
  Italic,
  Underline,
  X,
  Plus,
  Folder,
  BotIcon,
} from "lucide-react"
import { useNotes } from "./note-context"
import AiAssistant from "./ai-assistant"

export default function NoteEditor({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { notes, folders, activeNoteId, updateNote, addTag, removeTag, moveNote } = useNotes()
  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0]
  const currentFolder = activeNote?.folderId ? folders.find((f) => f.id === activeNote.folderId) : null

  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(activeNote?.title || "")
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)

  const contentEditableRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const folderDropdownRef = useRef<HTMLDivElement>(null)

  // Close folder dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
        setShowFolderDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Sync the content state with the contentEditable element when active note changes
  useEffect(() => {
    if (contentEditableRef.current && activeNote) {
      // Only update the innerHTML if it's different from the current content
      // This prevents cursor jumping and text reversal
      if (contentEditableRef.current.innerHTML !== (activeNote.htmlContent || activeNote.content)) {
        contentEditableRef.current.innerHTML = activeNote.htmlContent || activeNote.content
      }
      setTitleValue(activeNote.title)
      updateCounts(activeNote.content)
    }
  }, [activeNote])

  // Focus the title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingTitle])

  const updateCounts = (text: string) => {
    const trimmedText = text.trim()
    setCharCount(trimmedText.length)
    setWordCount(trimmedText === "" ? 0 : trimmedText.split(/\s+/).length)
  }

  const handleContentChange = () => {
    if (contentEditableRef.current && activeNote) {
      const htmlContent = contentEditableRef.current.innerHTML
      const textContent = contentEditableRef.current.textContent || ""

      updateNote(activeNote.id, {
        content: textContent,
        htmlContent: htmlContent,
      })

      updateCounts(textContent)
    }
  }

  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (activeNote) {
      updateNote(activeNote.id, { title: titleValue || "Untitled Note" })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur()
    }
  }

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value)
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim() && activeNote) {
      addTag(activeNote.id, newTag.trim())
      setNewTag("")
      tagInputRef.current?.focus()
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (activeNote) {
      removeTag(activeNote.id, tag)
    }
  }

  const handleMoveNote = (folderId: string | null) => {
    if (activeNote) {
      moveNote(activeNote.id, folderId)
      setShowFolderDropdown(false)
    }
  }

  // Format text functions
  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    // Focus back on the editor
    contentEditableRef.current?.focus()
  }

  const toggleAiAssistant = () => {
    setIsAiAssistantOpen(!isAiAssistantOpen)
  }

  return (
    <div className="editor-container">
      <div className="app-header">
        <button onClick={toggleSidebar} className="menu-button" aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <span className="app-title">NoteFolio</span>
      </div>

      <div className="editor-metadata">
        <div className="folder-path" onClick={() => setShowFolderDropdown(!showFolderDropdown)}>
          <Folder size={14} />
          <span>{currentFolder ? currentFolder.name : "Root"}</span>
          {showFolderDropdown && (
            <div className="folder-dropdown" ref={folderDropdownRef}>
              <div className="folder-dropdown-item" onClick={() => handleMoveNote(null)}>
                Root
              </div>
              {folders.map((folder) => (
                <div key={folder.id} className="folder-dropdown-item" onClick={() => handleMoveNote(folder.id)}>
                  {folder.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          className="editor-title-input"
          value={titleValue}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
      ) : (
        <h1 className="editor-title" onClick={handleTitleClick}>
          {activeNote?.title || "Untitled Note"}
        </h1>
      )}

      <div className="tags-container">
        <div className="tags-list">
          {activeNote?.tags.map((tag) => (
            <div key={tag} className="tag">
              <span>{tag}</span>
              <button className="remove-tag" onClick={() => handleRemoveTag(tag)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="add-tag-form">
          <input
            ref={tagInputRef}
            type="text"
            className="tag-input"
            placeholder="Add tag..."
            value={newTag}
            onChange={handleNewTagChange}
          />
          <button type="submit" className="add-tag-button" disabled={!newTag.trim()}>
            <Plus size={14} />
          </button>
        </form>
      </div>

      <div className="toolbar">
        <button className="toolbar-button" aria-label="Bold text" onClick={() => formatText("bold")}>
          <Bold size={20} />
        </button>
        <button className="toolbar-button" aria-label="Italic text" onClick={() => formatText("italic")}>
          <Italic size={20} />
        </button>
        <button className="toolbar-button" aria-label="Underline text" onClick={() => formatText("underline")}>
          <Underline size={20} />
        </button>
        <button
          className="toolbar-button"
          aria-label="Insert image"
          onClick={() => formatText("insertImage", prompt("Enter image URL") || "")}
        >
          <ImageIcon size={20} />
        </button>
        <button
          className="toolbar-button"
          aria-label="Insert file"
          onClick={() =>
            formatText("insertHTML", `<a href="${prompt("Enter file URL") || ""}" target="_blank">File</a>`)
          }
        >
          <FileText size={20} />
        </button>
        <button className="toolbar-button" aria-label="Align text" onClick={() => formatText("justifyLeft")}>
          <AlignLeft size={20} />
        </button>
        <button className="toolbar-button" aria-label="Bulleted list" onClick={() => formatText("insertUnorderedList")}>
          <List size={20} />
        </button>
        <button className="toolbar-button" aria-label="Numbered list" onClick={() => formatText("insertOrderedList")}>
          <ListOrdered size={20} />
        </button>
        <button className="toolbar-button" aria-label="AI Assistant" onClick={toggleAiAssistant}>
          <BotIcon size={20} />
        </button>
      </div>

      <div className="editor-content">
        <div
          ref={contentEditableRef}
          className="content-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
        />
      </div>

      <div className="editor-footer">
        <div className="word-count">
          {wordCount} {wordCount === 1 ? "word" : "words"} | {charCount} {charCount === 1 ? "character" : "characters"}
        </div>
      </div>

      <AiAssistant isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
    </div>
  )
}

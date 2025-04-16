"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Note } from "@/types/note"

interface NoteEditorProps {
  note: Note
  onUpdateNote: (note: Note) => void
}

export default function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  // Use controlled components for both title and content
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  // Update local state when the note prop changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id, note.title, note.content])

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    onUpdateNote({ ...note, title: newTitle })
  }

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdateNote({ ...note, content: newContent })
  }

  // Apply formatting by wrapping selected text with markdown syntax
  const applyFormatting = (formatType: string) => {
    const textarea = document.getElementById("note-content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let formattedText = ""
    let cursorOffset = 0

    switch (formatType) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorOffset = 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorOffset = 1
        break
      case "underline":
        formattedText = `<u>${selectedText}</u>`
        cursorOffset = 3
        break
      case "bullet":
        formattedText = `\n- ${selectedText}`
        cursorOffset = 3
        break
      case "number":
        formattedText = `\n1. ${selectedText}`
        cursorOffset = 4
        break
      default:
        return
    }

    // Create new content with the formatted text
    const newContent = content.substring(0, start) + formattedText + content.substring(end)

    // Update state and parent
    setContent(newContent)
    onUpdateNote({ ...note, content: newContent })

    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + formattedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <div className="h-full flex flex-col">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="text-xl font-medium px-4 py-2 w-full focus:outline-none border-b border-gray-200"
        placeholder="Note title"
      />

      <div className="px-4 py-2 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => applyFormatting("bold")}
          className="font-bold hover:bg-gray-100 px-2 py-1 rounded"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => applyFormatting("italic")}
          className="italic hover:bg-gray-100 px-2 py-1 rounded"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => applyFormatting("underline")}
          className="underline hover:bg-gray-100 px-2 py-1 rounded"
          title="Underline"
        >
          U
        </button>
        <button
          onClick={() => applyFormatting("bullet")}
          className="hover:bg-gray-100 px-2 py-1 rounded"
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => applyFormatting("number")}
          className="hover:bg-gray-100 px-2 py-1 rounded"
          title="Numbered List"
        >
          1.
        </button>
      </div>

      {/* Remove border from textarea */}
      <textarea
        id="note-content"
        value={content}
        onChange={handleContentChange}
        className="flex-1 p-4 w-full resize-none focus:outline-none font-sans text-base"
        placeholder="Start writing your notes here..."
      />
    </div>
  )
}

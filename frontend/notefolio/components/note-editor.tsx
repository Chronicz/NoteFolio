"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ImageIcon, FileText, AlignLeft, List, ListOrdered, Menu } from "lucide-react"

export default function NoteEditor() {
  const [title, setTitle] = useState("Hello World")
  const [content, setContent] = useState("Hello class. This is Notefolio")
  const contentEditableRef = useRef<HTMLDivElement>(null)

  // Sync the content state with the contentEditable element
  useEffect(() => {
    if (contentEditableRef.current) {
      // Only set the innerHTML if it's different from the current content
      // This prevents cursor jumping
      if (contentEditableRef.current.textContent !== content) {
        contentEditableRef.current.textContent = content
      }
    }
  }, [content])

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    // Update the content state with the current text content
    setContent(e.currentTarget.textContent || "")
  }

  return (
    <div className="editor-container">
      <div className="app-header">
        <Menu size={18} />
        <span className="app-title">NoteFolio</span>
      </div>

      <h1 className="editor-title">{title}</h1>

      <div className="toolbar">
        <button className="toolbar-button" aria-label="Insert image">
          <ImageIcon size={20} />
        </button>
        <button className="toolbar-button" aria-label="Insert file">
          <FileText size={20} />
        </button>
        <button className="toolbar-button" aria-label="Align text">
          <AlignLeft size={20} />
        </button>
        <button className="toolbar-button" aria-label="Bulleted list">
          <List size={20} />
        </button>
        <button className="toolbar-button" aria-label="Numbered list">
          <ListOrdered size={20} />
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
    </div>
  )
}

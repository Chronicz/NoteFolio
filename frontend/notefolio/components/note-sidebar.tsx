"use client"

import { Trash2 } from "lucide-react"
import type { Note } from "@/lib/types"

interface NoteSidebarProps {
  notes: Note[]
  activeNoteId: string
  onSelectNote: (id: string) => void
  onDeleteNote: (id: string) => void
  onAddNote: () => void
}

export default function NoteSidebar({ notes, activeNoteId, onSelectNote, onDeleteNote, onAddNote }: NoteSidebarProps) {
  return (
    <div className="w-60 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-medium text-lg">Notes</h2>
        <button onClick={onAddNote} className="text-2xl font-light">
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 border-b border-gray-200 cursor-pointer flex justify-between items-start ${
              activeNoteId === note.id ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
            onClick={() => onSelectNote(note.id)}
          >
            <div>
              <div className="font-medium">{note.title}</div>
              <div className="text-xs text-gray-500">{note.timestamp}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteNote(note.id)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

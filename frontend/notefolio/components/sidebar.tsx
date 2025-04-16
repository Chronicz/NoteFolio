"use client"

import { FiPlus } from "react-icons/fi"
import type { Note } from "@/types/note"
import { formatDate } from "@/utils/date-formatter"

interface SidebarProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  isOpen: boolean
}

export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isOpen,
}: SidebarProps) {
  if (!isOpen) return null

  return (
    <div className="w-64 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-medium text-gray-800">Notes</h2>
        <button
          onClick={onCreateNote}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
          aria-label="Create new note"
        >
          <FiPlus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notes yet</div>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id} className="border-b border-gray-200">
                <div
                  className={`p-3 cursor-pointer ${activeNoteId === note.id ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="overflow-hidden">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(note.updatedAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

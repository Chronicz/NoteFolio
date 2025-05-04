"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Folder {
  id: string
  name: string
  parentId: string | null
}

export interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  htmlContent?: string
  tags: string[]
  folderId: string | null
}

interface NoteContextType {
  notes: Note[]
  folders: Folder[]
  activeNoteId: string
  activeFolderId: string | null
  setActiveNoteId: (id: string) => void
  setActiveFolderId: (id: string | null) => void
  addNote: (folderId?: string | null) => void
  deleteNote: (id: string) => void
  updateNote: (id: string, data: Partial<Note>) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  addFolder: (name: string, parentId?: string | null) => void
  updateFolder: (id: string, data: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  moveNote: (noteId: string, folderId: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchBy: "title" | "tags" | "all"
  setSearchBy: (by: "title" | "tags" | "all") => void
  filteredNotes: Note[]
  getNotesInFolder: (folderId: string | null) => Note[]
  getSubfolders: (parentId: string | null) => Folder[]
}

const NoteContext = createContext<NoteContextType | undefined>(undefined)

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Hello World",
      content: "Hello class. This is Notefolio",
      timestamp: "03:45 PM",
      htmlContent: "Hello class. This is Notefolio",
      tags: ["welcome", "intro"],
      folderId: null,
    },
    {
      id: "2",
      title: "Untitled Note",
      content: "",
      timestamp: "03:57 PM",
      htmlContent: "",
      tags: [],
      folderId: null,
    },
  ])

  const [folders, setFolders] = useState<Folder[]>([
    {
      id: "folder-1",
      name: "Personal",
      parentId: null,
    },
    {
      id: "folder-2",
      name: "Work",
      parentId: null,
    },
    {
      id: "folder-3",
      name: "Projects",
      parentId: "folder-2",
    },
  ])

  const [activeNoteId, setActiveNoteId] = useState("1")
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchBy, setSearchBy] = useState<"title" | "tags" | "all">("all")

  const addNote = (folderId: string | null = activeFolderId) => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      htmlContent: "",
      tags: [],
      folderId: folderId,
    }
    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNoteId === id && notes.length > 1) {
      const remainingNotes = notes.filter((note) => note.id !== id)
      if (remainingNotes.length > 0) {
        setActiveNoteId(remainingNotes[0].id)
      }
    }
  }

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, ...data } : note)))
  }

  const addTag = (id: string, tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag) return

    setNotes(
      notes.map((note) => {
        if (note.id === id && !note.tags.includes(trimmedTag)) {
          return { ...note, tags: [...note.tags, trimmedTag] }
        }
        return note
      }),
    )
  }

  const removeTag = (id: string, tag: string) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, tags: note.tags.filter((t) => t !== tag) }
        }
        return note
      }),
    )
  }

  const addFolder = (name: string, parentId: string | null = null) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    }
    setFolders([...folders, newFolder])
    return newFolder.id
  }

  const updateFolder = (id: string, data: Partial<Folder>) => {
    setFolders(folders.map((folder) => (folder.id === id ? { ...folder, ...data } : folder)))
  }

  const deleteFolder = (id: string) => {
    // Move notes in this folder to parent folder or root
    const folderToDelete = folders.find((f) => f.id === id)
    if (!folderToDelete) return

    // Update notes in this folder
    setNotes(
      notes.map((note) => {
        if (note.folderId === id) {
          return { ...note, folderId: folderToDelete.parentId }
        }
        return note
      }),
    )

    // Move subfolders to parent
    const subfolders = folders.filter((f) => f.parentId === id)
    setFolders(
      folders.map((folder) => {
        if (folder.parentId === id) {
          return { ...folder, parentId: folderToDelete.parentId }
        }
        return folder
      }),
    )

    // Delete the folder
    setFolders(folders.filter((folder) => folder.id !== id))

    // Update active folder if needed
    if (activeFolderId === id) {
      setActiveFolderId(folderToDelete.parentId)
    }
  }

  const moveNote = (noteId: string, folderId: string | null) => {
    setNotes(notes.map((note) => (note.id === noteId ? { ...note, folderId } : note)))
  }

  const getNotesInFolder = (folderId: string | null) => {
    return notes.filter((note) => note.folderId === folderId)
  }

  const getSubfolders = (parentId: string | null) => {
    return folders.filter((folder) => folder.parentId === parentId)
  }

  // Filter notes based on search term and search type
  const filteredNotes = notes.filter((note) => {
    // If we're in a folder view and not searching, only show notes in the current folder
    if (!searchTerm && activeFolderId !== null) {
      return note.folderId === activeFolderId
    }

    // If we're searching, apply search filters
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    if (searchBy === "title") {
      return note.title.toLowerCase().includes(lowerSearchTerm)
    }

    if (searchBy === "tags") {
      return note.tags.some((tag) => tag.includes(lowerSearchTerm))
    }

    // searchBy === "all"
    return note.title.toLowerCase().includes(lowerSearchTerm) || note.tags.some((tag) => tag.includes(lowerSearchTerm))
  })

  return (
    <NoteContext.Provider
      value={{
        notes,
        folders,
        activeNoteId,
        activeFolderId,
        setActiveNoteId,
        setActiveFolderId,
        addNote,
        deleteNote,
        updateNote,
        addTag,
        removeTag,
        addFolder,
        updateFolder,
        deleteFolder,
        moveNote,
        searchTerm,
        setSearchTerm,
        searchBy,
        setSearchBy,
        filteredNotes,
        getNotesInFolder,
        getSubfolders,
      }}
    >
      {children}
    </NoteContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NoteContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider")
  }
  return context
}

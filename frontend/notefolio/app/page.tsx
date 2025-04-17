"use client"

import { useState } from "react"
import NoteEditor from "../components/note-editor"
import Sidebar from "../components/note-sidebar"
import { NoteProvider } from "../components/note-context"

export default function Home() {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <NoteProvider>
      <main className={`app-container ${sidebarVisible ? "" : "sidebar-hidden"}`}>
        {sidebarVisible && <Sidebar />}
        <NoteEditor toggleSidebar={toggleSidebar} />
      </main>
    </NoteProvider>
  )
}

import NoteEditor from "@/components/note-editor"
import Sidebar from "../components/note-sidebar"

export default function Home() {
  return (
    <main className="app-container">
      <Sidebar />
      <NoteEditor />
    </main>
  )
}

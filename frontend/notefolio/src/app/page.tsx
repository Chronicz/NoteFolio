import Sidebar from "@/components/SideBar"
import TopBar from "@/components/TopBar"
import PageContent from "@/components/PageContent"

export default function Home() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <PageContent />
      </main>
    </div>
  )
}

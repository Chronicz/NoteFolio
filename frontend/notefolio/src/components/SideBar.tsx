import Link from "next/link"
import { ChevronDown, Plus, Search } from "lucide-react"

export default function SideBar() {
    return (
        <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
            <div className="p-4">
                <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-200 rounded p-2">
                    <span>Workspace</span>
                    <ChevronDown size={16} />
                </button>
            </div>
            <div className="px-4 mb-4">
                <button className="flex items-center w-full text-left text-sm text-gray-600 hover:bg-gray-200 rounded p-2">
                    <Search size={16} className="mr-2" />
                    <span>Search</span>
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
                <ul className="px-2">
                    {["Page 1", "Page 2", "Page 3"].map((page, index) => (
                        <li key={index}>
                            <Link
                                href={`/page/${index + 1}`}
                                className="block py-1 px-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                            >
                                {page}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4">
                <button className="flex items-center w-full text-left text-sm text-gray-600 hover:bg-gray-200 rounded p-2">
                    <Plus size={16} className="mr-2" />
                    <span>New+</span>
                </button>
            </div>
        </div>
    )
}


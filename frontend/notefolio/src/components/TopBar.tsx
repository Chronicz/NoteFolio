import { Search, Settings, User } from "lucide-react"

export default function TopBar() {
    return (
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Search"
                    className="text-black bg-gray-100 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
            </div>
            <div className="flex items-center space-x-4">
                <button className="text-black hover:text-gray-800 z-1">
                    <Search size={18} />
                </button>
                <button className="text-black hover:text-gray-800 z-1">
                    <Settings size={18} />
                </button>
                <button className="text-black hover:text-gray-800 z-1">
                    <User size={18} />
                </button>
            </div>
        </div>
    )
}


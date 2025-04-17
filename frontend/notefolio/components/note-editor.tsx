// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Menu, ImageIcon, FileText, AlignLeft, AlignCenter, AlignJustify } from "lucide-react"
// import type { Note } from "@/lib/types"

// interface NoteEditorProps {
//   note: Note
//   onUpdateNote: (note: Note) => void
// }

// export default function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
//   const [title, setTitle] = useState(note.title)
//   const [content, setContent] = useState(note.content)

//   useEffect(() => {
//     setTitle(note.title)
//     setContent(note.content)
//   }, [note.id, note.title, note.content])

//   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTitle(e.target.value)
//     onUpdateNote({
//       ...note,
//       title: e.target.value,
//     })
//   }

//   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setContent(e.target.value)
//     onUpdateNote({
//       ...note,
//       content: e.target.value,
//     })
//   }

//   return (
//     <div className="flex-1 flex flex-col">
//       <div className="flex items-center p-4 border-b border-gray-200">
//         <Menu className="mr-2" />
//         <h1 className="text-xl font-medium">NoteFolio</h1>
//       </div>

//       <div className="p-4">
//         <input
//           type="text"
//           value={title}
//           onChange={handleTitleChange}
//           className="text-2xl font-bold w-full mb-4 outline-none"
//         />

//         <div className="flex gap-4 mb-4 border-b border-gray-200 pb-4">
//           <button className="p-2 hover:bg-gray-100 rounded">
//             <ImageIcon size={20} />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded">
//             <FileText size={20} />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded">
//             <AlignLeft size={20} />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded">
//             <AlignCenter size={20} />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded">
//             <AlignJustify size={20} />
//           </button>
//         </div>

//         <textarea
//           value={content}
//           onChange={handleContentChange}
//           className="w-full h-full outline-none resize-none"
//           placeholder="Start typing..."
//         />
//       </div>
//     </div>
//   )
// }


export default function Test() {
  return (
    <div className="text-red-500 bg-blue-500 p-4">
      This should be red text on a blue background with padding
    </div>
  )
}
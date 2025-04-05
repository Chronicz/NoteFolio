"use client"

import { useState, useEffect, useRef } from "react"

interface BlockEditorProps {
    content: string
    onChange: (content: string) => void
}

export default function BlockEditor({ content, onChange }: BlockEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditing])

    const handleBlur = () => {
        setIsEditing(false)
    }

    return (
        <div className="mb-2">
            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    className="text-black w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={3}
                />
            ) : (
                <p onClick={() => setIsEditing(true)} className="text-black p-2 hover:bg-gray-100 rounded cursor-text">
                    {content || "Click to edit..."}
                </p>
            )}
        </div>
    )
}


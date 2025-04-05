"use client"

import { useState } from "react"
import BlockEditor from "./BlockEditor"

export default function PageContent() {
    const [blocks, setBlocks] = useState([{ id: 1, content: "Welcome to your Notion clone!" }])

    const addBlock = () => {
        const newBlock = { id: Date.now(), content: "" }
        setBlocks([...blocks, newBlock])
    }

    const updateBlock = (id: number, content: string) => {
        setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
    }

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <h1 className="text-black text-4xl font-bold mb-4">NoteFolio</h1>
            {blocks.map((block) => (
                <BlockEditor key={block.id} content={block.content} onChange={(content) => updateBlock(block.id, content)} />
            ))}
            <button onClick={addBlock} className="mt-4 text-gray-500 hover:text-gray-700">
                + Add block
            </button>
        </div>
    )
}


"use client"

import { useState } from "react"
import BlockEditor from "./BlockEditor"
import AIAssistant from "./AIAssistant"

export default function PageContent() {
    const [blocks, setBlocks] = useState([{ id: 1, content: "Welcome to your Notion clone!" }])

    const addBlock = () => {
        const newBlock = { id: Date.now(), content: "" }
        setBlocks([...blocks, newBlock])
    }

    const updateBlock = (id: number, content: string) => {
        setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
    }

    // 获取所有笔记内容，用于AI上下文
    const getAllContent = () => {
        return blocks.map(block => block.content).join("\n\n")
    }

    // 插入AI生成的内容到新块
    const insertAIContent = (content: string) => {
        const newBlock = { id: Date.now(), content }
        setBlocks([...blocks, newBlock])
    }

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <h1 className="text-black text-4xl font-bold mb-6">NoteFolio</h1>
            <div className="w-full max-w-3xl mx-auto">
                {blocks.map((block) => (
                    <BlockEditor key={block.id} content={block.content} onChange={(content) => updateBlock(block.id, content)} />
                ))}
                <button onClick={addBlock} className="mt-4 text-gray-500 hover:text-gray-700">
                    + Add block
                </button>
            </div>
            
            {/* AI助手组件 - 可以从环境变量获取API密钥 */}
            <AIAssistant 
                noteContent={getAllContent()} 
                onInsertContent={insertAIContent} 
                apiKey={process.env.NEXT_PUBLIC_AI_API_KEY} 
            />
        </div>
    )
}




"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Send, History, Trash, ExternalLink, Languages, RotateCcw, Copy, ArrowDown, PlusCircle } from 'lucide-react'
import { useNotes } from './note-context'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  timestamp: number
}

interface AIResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
      reasoning_content?: string
      tool_calls?: {
        id: string
        type: string
        function: {
          name: string
          arguments: string
        }
      }[]
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  created: number
  model: string
  object: string
}

export default function AiAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { notes, activeNoteId, updateNote } = useNotes()
  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0]
  
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [useNoteContent, setUseNoteContent] = useState(false)
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 从本地存储加载聊天历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to parse chat history', e)
      }
    }
  }, [])

  // 保存聊天历史到本地存储
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // 当消息变化时滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 当对话窗口打开时，自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus()
    }
  }, [isOpen])

  // 当笔记发生变化时，更新是否使用笔记内容的状态
  useEffect(() => {
    setUseNoteContent(false)
  }, [activeNoteId])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!input.trim() && !useNoteContent) return
    
    const userContent = useNoteContent 
      ? `${input.trim() ? input + "\n\n" : ""}笔记内容：\n${activeNote.content}`
      : input

    const userMessage: Message = {
      role: 'user',
      content: userContent,
      timestamp: Date.now()
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)
    setUseNoteContent(false)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY
      
      if (!apiKey) {
        throw new Error('API key is not set.')
      }
      
      // 根据当前选择的语言添加系统消息
      const systemMessage = {
        role: "system",
        content: language === 'zh' 
          ? "你是一个AI助手，请使用中文回答问题。" 
          : "You are an AI assistant. Please respond in English."
      }

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/QwQ-32B",
          messages: [
            systemMessage, 
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })), 
            {
              role: userMessage.role,
              content: userMessage.content
            }
          ],
          stream: false,
          max_tokens: 1000,
          stop: null,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          response_format: { type: "text" }
        })
      }
      
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options)
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }
      
      const data: AIResponse = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now()
      }
      
      setMessages((prev) => [...prev, assistantMessage])
      
      // 如果是新对话，创建一个新的聊天历史
      if (!activeChatId) {
        const newChatId = `chat_${Date.now()}`
        const chatTitle = input.trim() 
          ? input.slice(0, 30) + (input.length > 30 ? '...' : '')
          : '基于笔记内容的对话'
        
        const newChat: ChatHistory = {
          id: newChatId,
          title: chatTitle,
          messages: [userMessage, assistantMessage],
          timestamp: Date.now()
        }
        
        setChatHistory((prev) => [newChat, ...prev])
        setActiveChatId(newChatId)
      } else {
        // 更新现有聊天
        setChatHistory((prev) => 
          prev.map((chat) => 
            chat.id === activeChatId 
              ? { ...chat, messages: [...chat.messages, userMessage, assistantMessage], timestamp: Date.now() } 
              : chat
          )
        )
      }
    } catch (err) {
      console.error('API请求错误:', err)
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setActiveChatId(null)
    setInput('')
    setError(null)
    textareaRef.current?.focus()
  }

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setActiveChatId(chatId)
      setShowHistory(false)
    }
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
    if (chatId === activeChatId) {
      setMessages([])
      setActiveChatId(null)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  // 将AI助手的回答插入笔记
  const insertToNote = (content: string) => {
    if (activeNote) {
      const updatedHtmlContent = activeNote.htmlContent 
        ? `${activeNote.htmlContent}<div class="ai-response-content">${content.replace(/\n/g, '<br>')}</div>`
        : `<div class="ai-response-content">${content.replace(/\n/g, '<br>')}</div>`

      const updatedContent = activeNote.content 
        ? `${activeNote.content}\n\n${content}`
        : content

      updateNote(activeNote.id, {
        content: updatedContent,
        htmlContent: updatedHtmlContent,
      })
    }
  }

  // 使用笔记内容作为用户输入的一部分
  const useCurrentNoteContent = () => {
    setUseNoteContent(true)
    textareaRef.current?.focus()
  }

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }
  
  // 获取语言显示文本
  const getLanguageText = () => {
    return language === 'zh' ? '中/英' : 'CN/EN'
  }

  // 获取占位符文本
  const getPlaceholderText = () => {
    if (useNoteContent) {
      return language === 'zh' ? "添加额外提示（可选）..." : "Add extra prompts (optional)..."
    } else {
      return language === 'zh' ? "输入你的问题..." : "Type your question..."
    }
  }

  // 获取空聊天提示文本
  const getEmptyChatText = () => {
    return language === 'zh' 
      ? "你好！有什么我可以帮助你的？"
      : "Hello! How can I assist you today?"
  }

  // 获取按钮文本
  const getButtonText = () => {
    return {
      useNoteContent: language === 'zh' ? "使用当前笔记内容提问" : "Use current note content",
      insertToNote: language === 'zh' ? "插入到笔记" : "Insert to note",
      retry: language === 'zh' ? "重试" : "Retry",
      newChat: language === 'zh' ? "新对话" : "New Chat",
      historyEmpty: language === 'zh' ? "没有历史对话" : "No history",
      historyTitle: language === 'zh' ? "历史对话" : "History",
      includeNoteContent: language === 'zh' ? "包含笔记内容" : "Including note content"
    }
  }

  if (!isOpen) return null

  const buttonText = getButtonText()

  return (
    <div className={`ai-assistant-container ${showHistory ? 'with-history' : ''}`}>
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-sidebar-header">
            <h3>{buttonText.historyTitle}</h3>
            <button 
              className="close-history-button" 
              onClick={() => setShowHistory(false)}
              aria-label="关闭历史"
            >
              <X size={18} />
            </button>
          </div>
          
          <button className="new-chat-button" onClick={startNewChat}>
            {buttonText.newChat}
          </button>
          
          <div className="history-list">
            {chatHistory.length === 0 ? (
              <div className="empty-history">
                <p>{buttonText.historyEmpty}</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`history-item ${activeChatId === chat.id ? 'active' : ''}`} 
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="history-item-content">
                    <div className="history-note-title">{chat.title}</div>
                    <div className="history-timestamp">{formatDate(chat.timestamp)}</div>
                  </div>
                  <button 
                    className="delete-history-button" 
                    onClick={(e) => deleteChat(chat.id, e)}
                    aria-label="删除对话"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="ai-assistant-main">
        <div className="ai-assistant-header">
          <div className="ai-assistant-title">
            <span>AI assistant</span>
            <div className="service-status">QwQ-32B</div>
          </div>
          
          <div className="header-actions">
            <button 
              type="button" 
              className="new-chat-header-button"
              onClick={startNewChat}
              aria-label="新对话"
              title="开始新对话"
            >
              <PlusCircle size={16} />
            </button>
            <button 
              type="button" 
              className="language-button"
              onClick={toggleLanguage}
              aria-label="切换语言"
            >
              <Languages size={16} />
              <span>{getLanguageText()}</span>
            </button>
            <button 
              className="history-button" 
              onClick={() => setShowHistory(!showHistory)}
              aria-label="查看历史"
            >
              <History size={18} />
            </button>
            <button 
              className="close-button" 
              onClick={onClose}
              aria-label="关闭助手"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="ai-assistant-content">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>{getEmptyChatText()}</p>
                {activeNote && activeNote.content && (
                  <button 
                    className="note-content-button" 
                    onClick={useCurrentNoteContent}
                  >
                    <ArrowDown size={14} /> {buttonText.useNoteContent}
                  </button>
                )}
              </div>
            ) : (
              messages.map((message, index) => {
                // 处理内容，替换换行符以外的空白
                const processedContent = message.content
                  .replace(/^\s+|\s+$/g, '') // 移除开头和结尾的空白
                  .replace(/\n+/g, '\n'); // 合并多个换行符
                
                return (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="message-metadata">
                      <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div className="message-content">
                      {processedContent}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="message-actions">
                        <button 
                          className="action-button" 
                          onClick={() => insertToNote(message.content)}
                          title={language === 'zh' ? "插入到笔记" : "Insert to note"}
                        >
                          <Copy size={14} /> {buttonText.insertToNote}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => handleSubmit()} className="apply-button">
                  <RotateCcw size={14} /> {buttonText.retry}
                </button>
              </div>
            )}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-metadata">
                  <span className="message-time">{formatTimestamp(Date.now())}</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form className="ai-assistant-input" onSubmit={handleSubmit}>
          {useNoteContent && (
            <div className="note-content-badge">
              <span>{buttonText.includeNoteContent}</span> 
              <button onClick={() => setUseNoteContent(false)} aria-label={language === 'zh' ? "移除笔记内容" : "Remove note content"}>×</button>
            </div>
          )}
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText()}
              rows={1}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`send-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || (!input.trim() && !useNoteContent)}
              aria-label={language === 'zh' ? "发送消息" : "Send message"}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


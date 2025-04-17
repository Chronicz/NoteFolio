"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Props for the AIAssistant component
 * @param noteContent - The content of the current note being edited
 * @param onInsertContent - Callback function to insert AI content into the note
 */
interface AIAssistantProps {
  noteContent: string
  onInsertContent: (content: string) => void
}

/**
 * Represents a single message in the chat conversation
 */
interface Message {
  role: 'user' | 'assistant'  // Who sent the message
  content: string            // Message content 
  timestamp: number          // When the message was sent
}

/**
 * Represents a stored conversation with multiple messages
 */
interface Conversation {
  id: string                // Unique conversation identifier
  title: string             // Conversation title (derived from first user message)
  messages: Message[]       // Messages in this conversation
  createdAt: number         // When conversation was created
  updatedAt: number         // When conversation was last updated
}

/**
 * AI Assistant component that provides a chat interface for interacting with an AI
 * to get help with notes, templates, and organization
 */
export default function AIAssistant({ noteContent, onInsertContent }: AIAssistantProps) {
  // UI state
  const [isOpen, setIsOpen] = useState(true)        // Whether the assistant panel is open
  const [prompt, setPrompt] = useState("")          // Current user input
  const [isLoading, setIsLoading] = useState(false) // Whether AI is generating a response
  const [showSidebar, setShowSidebar] = useState(true) // Whether conversation history sidebar is visible
  
  // Conversation state
  const [currentMessages, setCurrentMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `• Welcome to NoteFolio! How can I help?
• Need assistance with:
  - Pages/databases
  - Blocks/templates
  - Integrations
  - Setup/tips
  - Something else?

Let me know! 😊`,
      timestamp: Date.now()
    }
  ])
  const [conversations, setConversations] = useState<Conversation[]>([])       // All saved conversations
  const [currentConversationId, setCurrentConversationId] = useState<string>("") // Active conversation ID
  
  // Reference to the bottom of the message area for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  /**
   * On initial load, fetch saved conversations from localStorage
   * and create a new conversation if none exists
   */
  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('notefolio_conversations')
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations))
    }
    
    // Create a new conversation if none is active
    if (!currentConversationId) {
      createNewConversation()
    }
  }, [])
  
  /**
   * Save conversations to localStorage whenever they change
   */
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('notefolio_conversations', JSON.stringify(conversations))
    }
  }, [conversations])
  
  /**
   * Update the current conversation in the conversations list
   * whenever new messages are added
   */
  useEffect(() => {
    if (currentConversationId && currentMessages.length > 1) {
      updateConversation(currentConversationId, currentMessages)
    }
  }, [currentMessages])
  
  /**
   * Creates a new conversation and sets it as active
   */
  const createNewConversation = () => {
    const newId = 'conv_' + Date.now()
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation ' + new Date().toLocaleDateString(),
      messages: [currentMessages[0]], // Keep welcome message
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    // Add new conversation to the list and set as current
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newId)
    setCurrentMessages([currentMessages[0]])
  }
  
  /**
   * Updates an existing conversation with new messages
   * @param id - Conversation ID to update
   * @param messages - New messages array
   */
  const updateConversation = (id: string, messages: Message[]) => {
    // Generate title from first user message
    let title = 'New Conversation'
    if (messages.length > 1 && messages[1].role === 'user') {
      // Use first user message as the title (truncated if needed)
      title = messages[1].content.substring(0, 30) + (messages[1].content.length > 30 ? '...' : '')
    }
    
    // Update conversation in the list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, messages, title, updatedAt: Date.now() } 
          : conv
      )
    )
  }
  
  /**
   * Loads a conversation from history and makes it active
   * @param id - Conversation ID to load
   */
  const loadConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setCurrentMessages(conversation.messages)
      setCurrentConversationId(id)
      
      // Close sidebar on mobile after loading a conversation
      if (window.innerWidth < 768) {
        setShowSidebar(false)
      }
    }
  }
  
  /**
   * Deletes a conversation from history
   * @param id - Conversation ID to delete
   * @param e - Click event
   */
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling to avoid loading the conversation
    
    if (confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(c => c.id !== id))
      
      // If deleting current conversation, create a new one
      if (id === currentConversationId) {
        createNewConversation()
      }
    }
  }
  
  /**
   * Gets the API key from environment variables or localStorage
   * @returns The API key string or empty string if not found
   */
  const getApiKey = () => {
    const envApiKey = process.env.NEXT_PUBLIC_NOTEFOLIO_API_KEY;
    const localStorageApiKey = localStorage.getItem('notefolio_api_key') || "";
    
    return envApiKey || localStorageApiKey;
  }
  
  /**
   * Scrolls to the bottom of the message area
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  /**
   * Auto-scroll when new messages are added
   */
  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])
  
  /**
   * Calls the AI API with current conversation context and prompt
   */
  const callAI = async () => {
    if (!prompt.trim()) return
    
    // Add user message to the conversation
    const userMessage: Message = { 
      role: 'user', 
      content: prompt,
      timestamp: Date.now()
    }
    setCurrentMessages(prev => [...prev, userMessage])
    
    // Clear input and show loading state
    setPrompt("")
    setIsLoading(true)
    
    try {
      // Get API key and validate
      const apiKey = getApiKey()
      if (!apiKey) {
        const errorMessage: Message = {
          role: 'assistant',
          content: "API key not found. Please set it in the .env.local file or localStorage.",
          timestamp: Date.now()
        }
        setCurrentMessages(prev => [...prev, errorMessage])
        setIsLoading(false)
        return
      }
      
      // Prepare API request with system prompt and conversation history
      const apiMessages = [
        {
          role: "system",
          content: `You are an AI assistant for NoteFolio, please answer questions using the following format:

[Question Restatement]: {Briefly restate the user's question}

[Direct Answer]: {Provide the core answer to the question, concisely}

[Detailed Explanation]: {Provide further background, concept clarification, or details}

${noteContent ? "[Related Note Content]: {Provide suggestions based on the user's current note}" : ""}

[Related Examples]: {If applicable, provide 1-2 specific examples}

[Summary]: {Briefly summarize the key points}

Important formatting rules:
1. Use "•" for main points, "-" for sub-points
2. Use clear headings specified in brackets [Heading]: format
3. DO NOT use markdown headings with # or ### symbols
4. Emphasize key information with **bold** or *italic* text
5. Use emojis occasionally to add friendliness`
        }
      ]
      
      // Add recent message history (skip welcome message)
      const messageHistory = currentMessages.slice(1)
      const recentMessages = messageHistory.slice(-5) // Only use last 5 messages for context
      recentMessages.forEach(msg => {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        })
      })
      
      // Add current user question with optional note content
      apiMessages.push({
        role: "user",
        content: prompt + (noteContent ? `\n\nHere's my current note content: ${noteContent}` : "")
      })
      
      // Set up API request options
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/QwQ-32B",
          messages: apiMessages,
          stream: false,
          max_tokens: 2000, // Token limit for response
          stop: null,
          temperature: 0.4, // Lower temperature for more focused responses
          top_p: 0.7,
          top_k: 40,
          frequency_penalty: 0.5, // Reduce repetition
          n: 1,
          response_format: { type: "text" }
        })
      }

      // Make API request
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      // Process API response
      const data = await response.json()
      
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        console.log("AI Response:", data.choices[0].message.content);
        const aiResponse: Message = { 
          role: 'assistant', 
          content: data.choices[0].message.content,
          timestamp: Date.now()
        }
        setCurrentMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      }
      setCurrentMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles keyboard input for submitting prompt
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      callAI()
    }
  }
  
  /**
   * Formats AI content and inserts it into the note
   * @param content - AI response content to insert
   */
  const handleInsert = (content: string) => {
    // Convert content to formatted text by removing markdown
    const formattedContent = content
      .replace(/###\s+/g, '') // Remove the ### mark
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Keep bold text but remove the marker
      .replace(/\[([^\]]+)\]:/g, '[$1]:') // Keep title format
      .trim();
      
    // Pass formatted content to parent component
    onInsertContent(formattedContent);
  }
  
  /**
   * Formats a timestamp into a localized date string
   * @param timestamp - Unix timestamp
   * @returns Formatted date string
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  // Quick prompt suggestions for new conversations
  const quickPrompts = [
    "Organize my note structure",
    "Create a study note template",
    "How to organize project notes",
    "Provide a meeting notes template"
  ]

  // Display just the floating button when minimized
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>
    )
  }

  // Main component UI with sidebar and chat area
  return (
    <div className="fixed bottom-6 right-6 md:w-[800px] w-[95vw] max-w-[95vw] h-[600px] bg-white rounded-xl shadow-xl overflow-hidden z-50 flex">
      {/* Left sidebar for conversation history */}
      <div className={`${showSidebar ? 'w-64 border-r border-gray-200' : 'w-0'} transition-all duration-200 flex flex-col bg-gray-50 h-full overflow-hidden`}>
        <div className="p-3 font-medium text-gray-700 border-b border-gray-200 bg-gray-100 flex justify-between items-center flex-shrink-0">
          <span>Conversation History</span>
          <button 
            onClick={createNewConversation}
            className="text-blue-600 text-sm hover:text-blue-800"
          >
            New
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversation history</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map(conv => (
                <li 
                  key={conv.id} 
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between ${
                    conv.id === currentConversationId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{conv.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</div>
                  </div>
                  <button 
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                    title="Delete conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Right chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Title bar */}
        <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-blue-700 rounded-full"
              title={showSidebar ? "Hide History" : "Show History"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <h3 className="font-bold text-xl">NoteFolio Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={createNewConversation}
              className="p-2 hover:bg-blue-700 rounded-full"
              title="New Conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-blue-700 rounded-full"
              title="Minimize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Chat content area displaying messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
          {currentMessages.map((message, index) => (
            <div 
              key={index} 
              className={`${
                message.role === 'user' 
                  ? 'bg-blue-100 text-blue-900 self-end' 
                  : 'bg-white text-gray-800 self-start border border-gray-200'
              } max-w-[90%] p-4 rounded-lg whitespace-pre-wrap shadow-sm`}
            >
              {!message.content ? (
                <div className="text-red-500">Content not available. Please try again.</div>
              ) : (
                // Convert message content to styled HTML with formatting
                <div className="markdown-content" dangerouslySetInnerHTML={{ 
                  __html: message.content
                    ? message.content
                        .replace(/^###\s*(.+)$/gm, '$1')
                        .replace(/\[([^\]]+)\]:/g, '<strong class="text-blue-600">[$1]:</strong><br/>')
                        .replace(/•/g, '•')
                        .replace(/\n\s*-\s/g, '<br>&nbsp;&nbsp;- ')
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                        .replace(/😊|🙂|😀|👍|✅/g, match => match)
                    : 'Content unavailable'
                }} />
              )}
              
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {formatDate(message.timestamp)}
                </div>
                
                {/* Show Insert button only for assistant messages */}
                {message.role === 'assistant' && message.content && (
                  <button
                    onClick={() => handleInsert(message.content)}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  >
                    Insert to note
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator (typing animation dots) */}
          {isLoading && (
            <div className="self-start bg-white p-4 rounded-lg flex items-center text-gray-500 border border-gray-200 shadow-sm">
              <div className="inline-block animate-bounce h-2 w-2 rounded-full bg-gray-500 mr-1"></div>
              <div className="inline-block animate-bounce h-2 w-2 rounded-full bg-gray-500 delay-75 mr-1"></div>
              <div className="inline-block animate-bounce h-2 w-2 rounded-full bg-gray-500 delay-150"></div>
            </div>
          )}
          
          {/* Invisible reference element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick prompt suggestions (only shown in new conversations) */}
        {currentMessages.length <= 1 && !isLoading && (
          <div className="px-4 py-3 bg-gray-100 grid grid-cols-2 gap-2 flex-shrink-0">
            {quickPrompts.map((promptText, index) => (
              <button
                key={index}
                onClick={() => {
                  setPrompt(promptText)
                  setTimeout(() => callAI(), 100)
                }}
                className="text-left p-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>
        )}
        
        {/* Input area for typing messages */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask how to organize your notes..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
              rows={2}
            />
            <button
              onClick={callAI}
              disabled={isLoading || !prompt.trim()}
              className={`p-3 rounded-lg ${
                isLoading || !prompt.trim()
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

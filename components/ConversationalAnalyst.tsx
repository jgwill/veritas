"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAppStore } from "../store"
import type { ChatMessage } from "../types"

const ConversationalAnalyst: React.FC = () => {
  const { toggleChatAnalyst, chatSession } = useAppStore((state) => ({
    toggleChatAnalyst: state.toggleChatAnalyst,
    chatSession: state.chatSession,
  }))

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add initial greeting message
    const greeting = chatSession
      ? "Hello! I'm your AI Analyst. Ask me anything about your current model, for example: 'What's the most dominant factor?' or 'Summarize the key performance issues.'"
      : "The AI Analyst is currently offline. Please ensure your API key is configured to enable this feature."

    setMessages([
      {
        id: "system-intro",
        role: "system",
        content: greeting,
      },
    ])
  }, [chatSession])

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !chatSession) return

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chatSession.sendMessage({ message: userMessage.content })
      const aiContent = response.text || "No response received"
      const aiMessage: ChatMessage = { id: `assistant-${Date.now()}`, role: "assistant", content: aiContent }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message to Gemini:", error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "system",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-30 transition-opacity" onClick={toggleChatAnalyst} />
      <div className="fixed bottom-4 right-4 h-[70vh] w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-40 rounded-lg flex flex-col border border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <ChatAnalystIcon /> <span className="ml-2">Conversational AI Analyst</span>
          </h2>
          <button
            onClick={toggleChatAnalyst}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={!chatSession ? "AI is disabled" : "Ask about your model..."}
              disabled={isLoading || !chatSession}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !chatSession}
              className="px-4 py-2 bg-tandt-primary text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : <SendIcon />}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  if (isSystem) {
    return (
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg mx-auto max-w-xs">
        {message.content}
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white">
          <SparklesIcon />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"}`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-end gap-2 justify-start">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white">
      <SparklesIcon />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-gray-200 dark:bg-gray-700 flex items-center space-x-1">
      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  </div>
)

// Icons
const ChatAnalystIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
    />
  </svg>
)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.023 16H10a1 1 0 00.748-1.684l-3.255-3.256a1 1 0 111.414-1.414l3.255 3.256A1 1 0 0012.828 14h-2.28a1 1 0 00-.947.684l-4.714 1.347 6.364-12.728z" />
  </svg>
)
const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v4M3 5h4M6.5 17.5l-1.5 1.5M18.5 5.5l1.5-1.5M12 21v-4M21 12h-4M17.5 17.5l-1.5-1.5M12 8a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

export default ConversationalAnalyst

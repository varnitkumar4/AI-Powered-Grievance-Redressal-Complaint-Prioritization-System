import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chatbot({ compact = false, apiUrl = "http://localhost:5000/api/chatbot" }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || loading) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: trimmedMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setError(null);

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
        signal: abortController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Chatbot Error:", err);
        setError(err.message || "Something went wrong");
        
        // Show error message in chat
        const errorMessage = {
          id: Date.now(),
          type: "error",
          content: `⚠️ Error: ${err.message || "Failed to get response. Please try again."}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
      setTimeout(() => setError(null), 3000);
    }
  };

  const clearChat = () => {
    if (messages.length > 0 && window.confirm("Clear all messages?")) {
      setMessages([]);
      setError(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex flex-col h-full ${
        compact
          ? "w-full"
          : "max-w-2xl mx-auto bg-white rounded-lg shadow-xl"
      }`}
      role="main"
      aria-label="Grievance Assistant Chatbot"
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? "p-2" : "p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg"}`}>
        <div className="flex items-center gap-2">
          <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} bg-white rounded-full flex items-center justify-center`}>
            <span className="text-blue-600 text-sm">🤖</span>
          </div>
          <div>
            <h2 className={`font-semibold text-white ${compact ? "text-sm" : "text-lg"}`}>
              Grievance Assistant
            </h2>
            {!compact && (
              <p className="text-xs text-blue-100">Get help with your grievances</p>
            )}
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-white hover:bg-blue-500 rounded p-1 transition-colors"
            aria-label="Clear chat"
            title="Clear all messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm">Describe your grievance and get AI-powered assistance</p>
            <p className="text-xs mt-1">The AI will help draft professional responses</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-l-lg rounded-br-lg"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-white border border-gray-200 rounded-r-lg rounded-bl-lg shadow-sm"
              } p-3`}
            >
              {message.type !== "user" && (
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-xs text-blue-600">
                    {message.type === "error" ? "⚠️ Error" : "🤖 AI Assistant"}
                  </strong>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              
              {message.type === "user" && (
                <div className="text-sm">{message.content}</div>
              )}
              
              {message.type === "ai" && (
                <>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    aria-label="Copy response"
                  >
                    {copiedMessageId === message.id ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </>
              )}
              
              {message.type === "error" && (
                <div className="text-sm">{message.content}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-r-lg rounded-bl-lg shadow-sm p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                <span className="text-xs text-gray-500 ml-1">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && error !== "Failed to copy to clipboard" && (
        <div className="mx-4 mb-2 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={sendMessage} className={`border-t ${compact ? "p-2" : "p-4"} bg-white`}>
        <div className="flex gap-2 items-end">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder={compact ? "Type your grievance..." : "Describe your grievance in detail..."}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              aria-label="Message input"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputMessage.length > 0 && (
                <span>Press Enter to send</span>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label="Send message"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            {!compact && !loading && <span>Send</span>}
          </button>
        </div>
        
        {!compact && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Get AI-powered assistance for drafting professional responses to grievances
          </p>
        )}
      </form>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Chatbot;
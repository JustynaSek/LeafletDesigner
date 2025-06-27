'use client';

import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  status: 'in_chat' | 'designing' | 'gathering_info';
  isLoading: boolean;
}

const ChatInterface = ({ messages, onSendMessage, status, isLoading }: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const getStatusMessage = () => {
    if (status === 'designing') {
        return 'The assistant is generating your leaflet with DALL-E 3. This may take a moment...';
    }
    // You can add more status messages here if needed
    return 'The assistant is typing...';
  }

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white flex flex-col max-w-3xl mx-auto h-[70vh] shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 2: Refine with AI</h2>
      
      <div className="flex-grow overflow-y-auto pr-4 space-y-4 mb-4">
        {messages.map((msg, index) => {
          // Hide DALL-E prompt messages from the user, but log them for developers
          if (
            msg.role === 'assistant' &&
            (msg.content.startsWith('DALL-E PROMPT:') || msg.content.toLowerCase().includes('dall-e prompt'))
          ) {
            console.log('[DALL-E Prompt]', msg.content);
            return null;
          }
          const isUser = msg.role === 'user';
          const isAssistant = msg.role === 'assistant';
          return (
            (isUser || isAssistant) && (
              <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {isAssistant && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-lg shadow-sm">
                    <span>AI</span>
                  </div>
                )}
                <div
                  className={`max-w-lg p-4 rounded-2xl shadow-md ${
                    isUser
                      ? 'bg-blue-50 text-blue-900 rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p style={{whiteSpace: "pre-wrap"}}>{msg.content}</p>
                </div>
                {isUser && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-lg shadow-sm">
                    <span>U</span>
                  </div>
                )}
              </div>
            )
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
          <LoadingSpinner />
          <span>{getStatusMessage()}</span>
        </div>
      )}
      <form onSubmit={handleSend} className="flex gap-3 mt-2">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoading ? "Waiting for response..." : "Your message..."}
          className="flex-grow p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 text-base shadow-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 
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
    <div className="p-4 sm:p-6 border border-gray-700 rounded-lg bg-gray-800 flex flex-col h-[70vh]">
      <h2 className="text-xl font-bold mb-4 text-white">Step 2: Refine with AI</h2>
      
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
          return (
            (msg.role === 'user' || msg.role === 'assistant') && (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <span className="text-2xl">🤖</span>}
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p style={{whiteSpace: "pre-wrap"}}>{msg.content}</p>
                </div>
                 {msg.role === 'user' && <span className="text-2xl">👤</span>}
              </div>
            )
          );
        })}
         <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto">
        {isLoading && (
             <div className="text-center text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
                <LoadingSpinner />
                <span>{getStatusMessage()}</span>
             </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isLoading ? "Waiting for response..." : "Your message..."}
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 
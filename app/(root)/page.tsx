'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import the components
import InitialForm from '../components/InitialForm';
import ChatInterface from '../components/ChatInterface';
import LeafletPreview from '../components/LeafletPreview';
import LoadingSpinner from '../components/LoadingSpinner';

type ConversationStatus = 'awaiting_form' | 'gathering_info' | 'in_chat' | 'designing' | 'completed' | 'error';
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const HomePage = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus>('awaiting_form');
  const [messages, setMessages] = useState<Message[]>([]);
  const [leafletUrl, setLeafletUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Function to handle the initial form submission
  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a more detailed first message to give the assistant context.
      const firstMessage = `
        Hello, I need help creating a leaflet. Here are the initial details:
        - Purpose: ${formData.purpose}
        - Target Audience: ${formData.targetAudience}
        - Primary Message/Headline: ${formData.keyMessage1}
        - Desired Size: ${formData.leafletSize}

        Please ask me any follow-up questions you have to complete the design.
      `.trim().replace(/\s+/g, ' ');

      const response = await axios.post('/api/chat', {
        message: firstMessage,
      });

      const { conversationId: newConversationId } = response.data;
      setConversationId(newConversationId);
      setStatus('in_chat');
      // Fetch initial messages
      fetchConversationData(newConversationId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start conversation.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch the entire conversation state from the backend
  const fetchConversationData = async (convId: string) => {
    if (!convId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/chat?conversationId=${convId}`);
      const { status: newStatus, messages: newMessages, leafletUrl: newLeafletUrl } = response.data;
      
      setStatus(newStatus);
      setMessages(newMessages);
      setLeafletUrl(newLeafletUrl);

    } catch (err: any) {
       setError(err.response?.data?.error || 'Failed to fetch conversation data.');
       setStatus('error');
    } finally {
        setIsLoading(false);
    }
  };


  // This is a simplified handler for the chat interface (to be built out later)
  const handleSendMessage = async (message: string) => {
      // For now, this is just a placeholder. The real logic will be in ChatInterface.tsx
      console.log("Message to send:", message);
      if (!conversationId) return;

      setIsLoading(true);
      setError(null);

      // Optimistic UI update
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      try {
          await axios.post('/api/chat', { message, conversationId });
          // After sending, refresh the whole conversation state
          fetchConversationData(conversationId);
      } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to send message.');
          // Optionally revert optimistic update here
      } finally {
          setIsLoading(false);
      }
  };
  
  // Render component based on status
  const renderContent = () => {
    switch (status) {
      case 'awaiting_form':
        return <InitialForm onFormSubmit={handleFormSubmit} isLoading={isLoading} />;
      case 'gathering_info':
      case 'in_chat':
      case 'designing':
        return <ChatInterface 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  status={status}
                  isLoading={isLoading}
               />; 
      case 'completed':
        return <LeafletPreview leafletUrl={leafletUrl} />;
      case 'error':
        return <div className="text-red-500 p-4 border border-red-500 rounded-lg">{error}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className='flex flex-col items-center gap-y-2'>
                <LoadingSpinner />
                <p className='text-white'>{status === 'designing' ? 'AI is generating your leaflet...' : 'Processing...'}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
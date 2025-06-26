'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { InitialForm } from "../components/InitialForm";
import ChatInterface from "../components/ChatInterface";
import LeafletPreview from "../components/LeafletPreview";
import LoadingSpinner from "../components/LoadingSpinner";
import { LoginButton } from "../components/LoginButton";
import { Button } from "@/components/ui/button";

type ConversationStatus =
  | "awaiting_form"
  | "gathering_info"
  | "in_chat"
  | "designing"
  | "completed"
  | "error";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function HomePage() {
  console.log("HomePage rendered");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus>("awaiting_form");
  const [history, setHistory] = useState<Message[]>([]);
  const [leafletUrl, setLeafletUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { data: session, status: sessionStatus } = useSession();
  console.log("session from useSession", session, sessionStatus);

  const handleStartConversation = async (initialData: {
    product: string;
    details: string;
    targetAudience: string;
    contactInfo: string;
    leafletSize: string;
  }) => {
    console.log("handleStartConversation called", { sessionStatus, session, initialData });
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
        console.error("Auth check FAILED inside handleStartConversation.", { sessionStatus, hasSession: !!session });
        setStatus("error");
        return;
    }

    setIsProcessing(true);
    setStatus("gathering_info");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: JSON.stringify(initialData), userId: session.user.id }),
      });
      if (!response.ok) throw new Error("Failed to start conversation");
      const data = await response.json();
      setConversationId(data.conversationId);
      // Fetch the actual messages for the conversation
      try {
        const messagesRes = await fetch(`/api/chat?conversationId=${data.conversationId}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setHistory(messagesData.messages || []);
          setStatus(messagesData.status || "in_chat");
          setLeafletUrl(messagesData.leafletUrl || null);
        } else {
          setHistory([]);
          setStatus("in_chat");
        }
      } catch (err) {
        setHistory([]);
        setStatus("in_chat");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    console.log("useEffect sessionStatus", { sessionStatus, session });
    if (sessionStatus === 'authenticated') {
      const pendingData = localStorage.getItem("pendingLeafletData");
      console.log("pendingData in useEffect", pendingData);
      if (pendingData) {
        const initialData = JSON.parse(pendingData);
        localStorage.removeItem("pendingLeafletData");
        handleStartConversation(initialData);
      }
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    if (!conversationId) return;
    if (!["gathering_info", "tool_executed"].includes(status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat?conversationId=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.messages || []);
          setStatus(data.status || "in_chat");
          setLeafletUrl(data.leafletUrl || null);
          if (!["gathering_info", "tool_executed"].includes(data.status)) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [conversationId, status]);

  const handleSendMessage = async (message: string) => {
    if (!conversationId) return;
    setIsProcessing(true);
    const newHistory: Message[] = [...history, { role: "user", content: message }];
    setHistory(newHistory);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();
      if (data.status === "completed" || data.status === "in_chat") {
        // Fetch the latest messages
        const messagesRes = await fetch(`/api/chat?conversationId=${conversationId}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setHistory(messagesData.messages || []);
          setStatus(messagesData.status || "in_chat");
          setLeafletUrl(messagesData.leafletUrl || null);
        } else {
          setHistory([]);
          setStatus("in_chat");
        }
      } else {
        setHistory([]);
        setStatus(data.status);
        setLeafletUrl(data.leafletUrl);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    await fetch('/api/clear-history', { method: 'POST' });
    setConversationId(null);
    setHistory([]);
    setStatus('awaiting_form');
    setLeafletUrl(null);
    setIsClearing(false);
  };

  const renderContent = () => {
    const pendingData = typeof window !== 'undefined' ? localStorage.getItem("pendingLeafletData") : null;
    console.log("renderContent", { sessionStatus, status, pendingData, isProcessing });
    if (sessionStatus === 'loading') {
      return <LoadingSpinner message="Loading session..." />;
    }
    
    if (sessionStatus === 'unauthenticated') {
      return <InitialForm onStartConversation={handleStartConversation} isLoading={isProcessing} />;
    }

    if (sessionStatus === 'authenticated') {
      if (pendingData && status !== 'in_chat' && !isProcessing) {
        return <LoadingSpinner message="Finalizing login..." />;
      }
      
      switch (status) {
        case "awaiting_form":
          return <InitialForm onStartConversation={handleStartConversation} isLoading={isProcessing} />;
        case "gathering_info":
           return <LoadingSpinner message="Preparing your chat..." />;
        case "in_chat":
          return (
            <ChatInterface
              messages={history}
              onSendMessage={handleSendMessage}
              isLoading={isProcessing}
              status={status}
            />
          );
        case "designing":
          return <LoadingSpinner message="AI is generating your leaflet..." />;
        case "completed":
          return <LeafletPreview leafletUrl={leafletUrl} />;
        case "error":
          return <p className="text-red-500 text-center">An error occurred. Please try refreshing the page.</p>;
        default:
          return <LoadingSpinner message="Initializing..." />;
      }
    }

    // Fallback for any other unexpected state
    return <LoadingSpinner message="Initializing..." />;
  }

  return (
    <div className="w-full">
      {sessionStatus === 'authenticated' && (
        <Button
          onClick={handleClearHistory}
          className={`mb-4 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors ${isClearing ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={isClearing}
        >
          {isClearing ? 'Clearing...' : 'Clear My History'}
        </Button>
      )}
      {renderContent()}
    </div>
  );
}
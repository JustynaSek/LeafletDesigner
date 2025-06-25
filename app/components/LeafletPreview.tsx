'use client';

import React from 'react';

interface LeafletPreviewProps {
  leafletUrl: string | null;
}

const LeafletPreview = ({ leafletUrl }: LeafletPreviewProps) => {
  if (!leafletUrl) {
    return (
      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong</h2>
        <p className="text-gray-400">We couldn't generate your leaflet. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">Your Leaflet is Ready!</h2>
      
      <div className="mb-6">
        <img 
          src={leafletUrl} 
          alt="Generated AI Leaflet" 
          className="w-full h-auto rounded-lg shadow-lg" 
        />
      </div>

      <div className="text-center">
        <a
          href={leafletUrl}
          download="ai_leaflet.png"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Download Leaflet
        </a>
      </div>
    </div>
  );
};

export default LeafletPreview; 
'use client';

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InitialFormProps {
  onFormSubmit: (formData: FormState) => void;
  isLoading?: boolean;
}

interface FormState {
  purpose: string;
  targetAudience: string;
  keyMessage1: string;
  keyMessage2: string;
  contactEmail: string;
  leafletSize: '1024x1792' | '1792x1024';
}

const InitialForm = ({ onFormSubmit, isLoading = false }: InitialFormProps) => {
  const [formData, setFormData] = useState<FormState>({
    purpose: '',
    targetAudience: '',
    keyMessage1: '',
    keyMessage2: '',
    contactEmail: '',
    leafletSize: '1024x1792',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  const inputClass = "w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-white">Start Your Leaflet Design</h2>
      <p className="mb-6 text-gray-400">Provide some initial details. An AI assistant will help you refine them later.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-300 mb-1">Purpose of Leaflet</label>
          <input
            type="text"
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="e.g., Grand Opening, Tech Conference"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
          <input
            type="text"
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="e.g., University Students, Local Families"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="keyMessage1" className="block text-sm font-medium text-gray-300 mb-1">Primary Message / Headline</label>
          <textarea
            id="keyMessage1"
            name="keyMessage1"
            value={formData.keyMessage1}
            onChange={handleChange}
            placeholder="e.g., '50% Off All Coffee!'"
            className={`${inputClass} h-20`}
            required
          />
        </div>

         <div>
          <label htmlFor="leafletSize" className="block text-sm font-medium text-gray-300 mb-1">Desired Leaflet Size</label>
          <select
            id="leafletSize"
            name="leafletSize"
            value={formData.leafletSize}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="1024x1792">Portrait (1024x1792)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Start Conversation with AI'}
        </button>
      </form>
    </div>
  );
};

export default InitialForm; 
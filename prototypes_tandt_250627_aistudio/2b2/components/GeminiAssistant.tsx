import React, { useState } from 'react';
import { suggestElementsFromTopic } from '../services/geminiService';

interface GeminiAssistantProps {
  onAddElements: (elements: { name: string; description: string }[]) => void;
  modelType: number;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onAddElements, modelType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const suggestedElements = await suggestElementsFromTopic(topic, modelType);
      if (suggestedElements.length > 0) {
        onAddElements(suggestedElements);
        setIsOpen(false);
        setTopic('');
      } else {
        setError('Could not generate suggestions. Please try a different topic.');
      }
    } catch (e) {
      setError('An error occurred. Please check the console.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
      >
        <SparklesIcon />
        <span className="ml-2">Suggest Elements with AI</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-tandt-dark dark:text-gray-100">AI Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Enter a topic for your model, and Gemini will suggest relevant elements.</p>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Topic</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Choosing a new car, Quarterly Sales Review"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {isLoading ? <Spinner /> : <SparklesIcon />}
            <span className="ml-2">{isLoading ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.707 1.707A1 1 0 003 8v4a1 1 0 00.293.707L5 14.414V16a1 1 0 001 1h1.586l1.707 1.707A1 1 0 0012 17h4a1 1 0 00.707-.293l1.707-1.707H19a1 1 0 001-1v-1.586l1.707-1.707A1 1 0 0017 8V4a1 1 0 00-.293-.707L15 1.586V0a1 1 0 00-1-1h-1.586l-1.707-1.707A1 1 0 008 1H4a1 1 0 00-.707.293L1.586 3H0a1 1 0 00-1 1zm14 11.586l-1.293 1.293A1 1 0 0017 16v1a1 1 0 01-1 1h-1.586l-1.293 1.293A1 1 0 0110 19H6a1 1 0 01-.707-.293L4 17.414V19a1 1 0 01-1 1H1.586l-1.293 1.293A1 1 0 01-2 21H-6a1 1 0 01-.707-.293L-8 19.414V21a1 1 0 01-1 1h-1.586l-1.293 1.293A1 1 0 01-14 21H-18a1 1 0 01-.707-.293L-20 19.414V21" transform="translate(10, -5) rotate(15)" clipRule="evenodd" /></svg>;
const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

export default GeminiAssistant;
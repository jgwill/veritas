'use client';

import React, { useState } from 'react';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
  const [copiedExample, setCopiedExample] = useState(false);

  if (!isOpen) return null;

  const generateUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/llm/generate-model` 
    : '/api/llm/generate-model';
  
  const schemaUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/llm/schema` 
    : '/api/llm/schema';

  const exampleCurl = `curl -X POST "${generateUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_VERITAS_API_KEY" \\
  -d '{
    "topic": "Q2 Engineering Team Performance",
    "model_type": 2,
    "description": "Mid-year review of the core engineering team.",
    "elements": [
      { "name": "Code Quality", "state": 1, "trend": 1 },
      { "name": "Delivery Velocity", "state": 0, "trend": 0 },
      { "name": "Technical Debt", "state": -1, "trend": -1 }
    ]
  }'`;

  const handleCopyExample = async () => {
    await navigator.clipboard.writeText(exampleCurl);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <KeyIcon className="h-5 w-5 text-tandt-primary" />
            <h2 className="text-xl font-bold text-tandt-dark dark:text-white">API Access</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Setup Instructions */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>
                Go to your Vercel project settings and add an environment variable:
                <code className="ml-2 bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono">VERITAS_API_KEY</code>
              </li>
              <li>
                Generate a secure random key, e.g.: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono text-xs">openssl rand -hex 32</code>
              </li>
              <li>
                Use this key as a Bearer token in your API requests
              </li>
            </ol>
          </div>

          {/* Endpoint Info */}
          <div>
            <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200 mb-2">LLM Endpoint</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-700 dark:text-gray-300">
              POST /api/llm/generate-model
            </div>
          </div>

          {/* Model Types */}
          <div>
            <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200 mb-2">Model Types</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <code className="shrink-0 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">model_type: 2</code>
                <span>Performance Review — Evaluate elements with state (-1/0/1) and trend (-1/0/1)</span>
              </div>
              <div className="flex items-start gap-3">
                <code className="shrink-0 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">model_type: 1</code>
                <span>Decision Making — Pairwise comparison to build dominance hierarchy</span>
              </div>
            </div>
          </div>

          {/* Example Request */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200">Example Request</h3>
              <button
                onClick={handleCopyExample}
                className="text-xs text-tandt-primary hover:underline"
              >
                {copiedExample ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto leading-relaxed">
              {exampleCurl}
            </pre>
          </div>

          {/* Schema Link */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Full OpenAPI schema:{' '}
              <a href={schemaUrl} target="_blank" rel="noreferrer" className="text-tandt-primary hover:underline">
                {schemaUrl}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

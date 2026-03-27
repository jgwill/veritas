'use client';

import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../services/authService';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/api-keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
      setGeneratedKey(null);
      setError(null);
    }
  }, [isOpen]);

  const handleCreateKey = async () => {
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName || 'API Key' })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create key');
      }

      const data = await res.json();
      setGeneratedKey(data.key);
      setNewKeyName('');
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      const token = getAuthToken();
      await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchKeys();
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (!isOpen) return null;

  const generateUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/llm/generate-model` 
    : '/api/llm/generate-model';

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
          {/* Generated Key Alert */}
          {generatedKey && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">API Key Created</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Copy this key now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-green-100 dark:bg-green-800 px-3 py-2 rounded font-mono text-sm break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="shrink-0 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                >
                  {copiedKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Create New Key */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Create New API Key</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (optional)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
              <button
                onClick={handleCreateKey}
                className="px-4 py-2 bg-tandt-primary text-white rounded-lg hover:bg-tandt-primary/90 text-sm font-medium"
              >
                Generate Key
              </button>
            </div>
          </div>

          {/* Existing Keys */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Your API Keys</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No API keys yet. Create one above.</p>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{key.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <code>{key.key_prefix}...</code>
                        {' · '}
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Example */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Usage Example</h3>
            <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto leading-relaxed">
{`curl -X POST "${generateUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "topic": "Q2 Team Performance",
    "model_type": 2,
    "elements": [
      { "name": "Code Quality", "state": 1, "trend": 1 }
    ]
  }'`}
            </pre>
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

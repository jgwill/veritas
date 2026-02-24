'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken } from '../services/authService';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/api-keys', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load API keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
      setRevealedKey(null);
      setCopiedKey(false);
    }
  }, [isOpen, fetchKeys]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setRevealedKey(null);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newKeyName.trim() || 'API Key' }),
      });
      if (!res.ok) throw new Error('Failed to create API key');
      const data = await res.json();
      setRevealedKey(data.key);
      setNewKeyName('');
      await fetchKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    try {
      await fetch(`/api/api-keys?id=${keyId}`, { method: 'DELETE', headers: authHeaders() });
      setKeys(prev => prev.filter(k => k.id !== keyId));
      if (revealedKey) setRevealedKey(null);
    } catch {
      setError('Failed to revoke key');
    }
  };

  const copyKey = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isOpen) return null;

  const schemaUrl = `${window.location.origin}/api/llm/schema`;
  const generateUrl = `${window.location.origin}/api/llm/generate-model`;

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
          {/* Intro */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use API keys to allow LLMs and external tools to create models on your behalf. Keys are prefixed with{' '}
              <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">tandt_sk_</code>.{' '}
              The full key is shown only once at creation.
            </p>
          </div>

          {/* Revealed key banner */}
          {revealedKey && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-4">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2 uppercase tracking-wide">
                New key — copy it now, it will not be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-xs bg-white dark:bg-gray-900 border border-green-300 dark:border-green-700 rounded px-3 py-2 break-all text-green-800 dark:text-green-200">
                  {revealedKey}
                </code>
                <button
                  onClick={copyKey}
                  className="shrink-0 px-3 py-2 text-sm font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  {copiedKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Create key */}
          <div>
            <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200 mb-3">Create new API key</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Claude, GPT-4)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-tandt-dark dark:text-gray-200 focus:ring-2 focus:ring-tandt-primary outline-none"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-tandt-primary text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Existing keys */}
          <div>
            <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200 mb-3">Your API keys</h3>
            {loading ? (
              <div className="text-sm text-gray-400 py-4 text-center">Loading...</div>
            ) : keys.length === 0 ? (
              <div className="text-sm text-gray-400 py-4 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                No API keys yet. Generate one above.
              </div>
            ) : (
              <ul className="space-y-2">
                {keys.map(k => (
                  <li key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-tandt-dark dark:text-gray-200 truncate">{k.name}</p>
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {k.key_prefix}••••••••••••••••
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Created {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="shrink-0 ml-3 px-3 py-1.5 text-xs font-semibold rounded-md text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Usage reference */}
          <div>
            <h3 className="text-sm font-semibold text-tandt-dark dark:text-gray-200 mb-3">LLM usage reference</h3>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs font-mono">
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                POST {generateUrl}
              </div>
              <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 leading-relaxed">{`Authorization: Bearer tandt_sk_<your_key>
Content-Type: application/json

{
  "topic": "Q2 Engineering Team Performance",
  "model_type": 2,
  "description": "Mid-year review of the core engineering team.",
  "elements": [
    { "name": "Code Quality", "state": 1, "trend": 1 },
    { "name": "Delivery Velocity", "state": 0, "trend": 0 },
    { "name": "Technical Debt", "state": -1, "trend": -1 }
  ]
}`}</pre>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Full OpenAPI schema available at{' '}
              <a href={schemaUrl} target="_blank" rel="noreferrer" className="text-tandt-primary underline">
                {schemaUrl}
              </a>
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
              {error}
            </p>
          )}
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

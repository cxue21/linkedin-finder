'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MessageDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  school: string;
  linkedInUrl: string;
  company?: string;  // NEW: optional company
  jobId?: string;    // NEW: optional job ID for saving
}

export default function MessageDraftModal({
  isOpen,
  onClose,
  name,
  school,
  linkedInUrl,
  company,
  jobId,
}: MessageDraftModalProps) {
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commonalities, setCommonalities] = useState<string[]>([]);

  // Generate draft when modal opens
  useEffect(() => {
    if (isOpen) {
      generateDraft();
      setCopied(false);
      setError('');
    }
  }, [isOpen, name, school]);

  const generateDraft = async () => {
    setLoading(true);
    setError('');
    setDraft('');
    setCommonalities([]);
    
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to generate messages');
      }

      // Call AI API
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: name,
          school: school,
          company: company,
          jobId: jobId,
          linkedInUrl: linkedInUrl
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.needsProfile) {
          throw new Error('Please add your profile in Settings first (click Settings in the navigation bar)');
        }
        throw new Error(data.error || 'Failed to generate message');
      }

      setDraft(data.draft);
      setCommonalities(data.commonalities || []);
      
    } catch (err: any) {
      setError(err.message);
      // Fallback to simple template if AI fails
      const fallbackDraft = `Hi ${name.split(' ')[0]},

I noticed we both have a connection to ${school}. I'm reaching out because I'm impressed by your background and would love to connect.

Would you be open to a brief chat?

Best regards`;
      setDraft(fallbackDraft);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            AI Message Draft
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Personalized message for {name}
          </p>
          
          {/* LinkedIn URL */}
          {linkedInUrl && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">LinkedIn:</span>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
              >
                {linkedInUrl}
              </a>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Generating AI message...</span>
          </div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ {error}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Using basic template as fallback.
                </p>
              </div>
            )}

            {/* Commonalities found */}
            {commonalities.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  ✓ Commonalities found:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {commonalities.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Message textarea */}
            <div className="mb-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows={12}
                placeholder="Generating message..."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Characters: {draft.length}/300
                </span>
                {draft.length > 300 && (
                  <span className="text-xs text-orange-600 font-medium">
                    ⚠️ May exceed LinkedIn limit
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                disabled={!draft}
                className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
              <button
                onClick={generateDraft}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                ↻ Regenerate
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              💡 Copy this message and use it when sending a LinkedIn connection request
            </p>
          </>
        )}
      </div>
    </div>
  );
}

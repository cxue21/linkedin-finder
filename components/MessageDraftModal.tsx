'use client';

import { useState, useEffect } from 'react';

interface MessageDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  school: string;
  linkedInUrl: string;
}

export default function MessageDraftModal({
  isOpen,
  onClose,
  name,
  school,
  linkedInUrl,
}: MessageDraftModalProps) {
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate draft when modal opens
  useEffect(() => {
    if (isOpen) {
      generateDraft();
      setCopied(false);
    }
  }, [isOpen, name, school]); // ← Only re-run when these change

  const generateDraft = async () => {
    setLoading(true);
    
    // Mock draft (replace with real API call later)
    const mockDraft = `Hi ${name.split(' ')[0]},

I noticed we both have a connection to ${school}. I'm reaching out because I'm impressed by your background and would love to connect.

I'd appreciate the opportunity to learn more about your experience and explore potential ways we might collaborate or support each other's goals.

Would you be open to a brief chat?

Best regards`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setDraft(mockDraft);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
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
            Message Draft
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Personalized message for {name}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Generating draft...</span>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows={12}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

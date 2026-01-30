'use client';

import { useState } from 'react';
import { JobResult } from '@/types';
import MessageDraftModal from './MessageDraftModal';

interface ResultsTableProps {
  results: JobResult[];
  jobId?: string;  // NEW: Add jobId prop
}

export default function ResultsTable({ results, jobId }: ResultsTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<JobResult | null>(null);

  const handleGenerateDraft = (result: JobResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedResult(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return '🟢';
    if (confidence >= 60) return '🟡';
    return '🔴';
  };

  if (!results || results.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No results yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                LinkedIn Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {result.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {result.school}
                </td>
                <td className="px-6 py-4 text-sm">
                  {result.linkedInUrl ? (
                    <a
                      href={result.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      View Profile →
                    </a>
                  ) : (
                    <span className="text-gray-400">Not found</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceColor(
                      result.confidence
                    )}`}
                  >
                    {getConfidenceIcon(result.confidence)} {result.confidence}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {result.linkedInUrl && (
                    <button
                      onClick={() => handleGenerateDraft(result)}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
                    >
                      ✨ Generate Message
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedResult && (
        <MessageDraftModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          name={selectedResult.name}
          school={selectedResult.school}
          linkedInUrl={selectedResult.linkedInUrl || ''}
          company={undefined}  // Can add later if you capture company in results
          jobId={jobId}        // NEW: Pass jobId
        />
      )}
    </>
  );
}

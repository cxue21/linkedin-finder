'use client';

import { useState, useRef } from 'react';
import { parseCSVFile } from '@/lib/parseCSV';
import { InputName } from '@/types';

interface FileUploadFormProps {
  onSubmit: (names: InputName[], inputMethod: 'file_upload') => Promise<void>;
  isLoading?: boolean;
}

export default function FileUploadForm({
  onSubmit,
  isLoading = false,  // ✅ Now we'll actually use this!
}: FileUploadFormProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setSuccess('');

    const result = await parseCSVFile(file);

    if (!result.success) {
      setError(result.error || 'Failed to parse file');
      return;
    }

    if (result.data && result.data.length > 0) {
      try {
        await onSubmit(result.data, 'file_upload');
        setSuccess(
          `Successfully submitted ${result.data.length} names for search`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Batch Upload (1-100 names)
        </h3>

        {/* ✅ CHANGE 1: Disable drop zone when loading */}
        <div
          onDragOver={isLoading ? undefined : handleDragOver}
          onDragLeave={isLoading ? undefined : handleDragLeave}
          onDrop={isLoading ? undefined : handleDrop}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
            isDragging && !isLoading
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center gap-2">
            {/* ✅ CHANGE 2: Show spinner when loading */}
            {isLoading ? (
              <svg
                className="h-10 w-10 text-teal-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            )}
            
            <div>
              {/* ✅ CHANGE 3: Show different text when loading */}
              {isLoading ? (
                <p className="text-sm font-medium text-gray-900">
                  Processing your file...
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    Drag and drop your CSV file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-teal-600 hover:text-teal-700"
                      disabled={isLoading}  // ✅ CHANGE 4: Disable button
                    >
                      click to select
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV format: Name, School (max 100 rows, 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ✅ CHANGE 5: Disable file input when loading */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}
    </div>
  );
}

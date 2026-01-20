'use client';

import { useState } from 'react';
import { InputName } from '@/types';

interface ManualJobFormProps {
  onSubmit: (names: InputName[], inputMethod: 'manual') => Promise<void>;
  isLoading?: boolean;
}

export default function ManualJobForm({
  onSubmit,
  isLoading = false,
}: ManualJobFormProps) {
  const [names, setNames] = useState<InputName[]>([{ name: '', school: '' }]);
  const [error, setError] = useState<string>('');

  const handleAddField = () => {
    if (names.length < 10) {
      setNames([...names, { name: '', school: '' }]);
    }
  };

  const handleRemoveField = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: 'name' | 'school',
    value: string
  ) => {
    const updated = [...names];
    updated[index][field] = value;
    setNames(updated);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const filledNames = names.filter((n) => n.name.trim() || n.school.trim());

    if (filledNames.length === 0) {
      setError('Please enter at least one name and school');
      return;
    }

    if (filledNames.length > 10) {
      setError('Maximum 10 names allowed');
      return;
    }

    // Ensure all filled entries have both name and school
    const incomplete = filledNames.some((n) => !n.name.trim() || !n.school.trim());
    if (incomplete) {
      setError('All entries must have both name and school');
      return;
    }

    try {
      await onSubmit(filledNames, 'manual');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Manual Entry (1-10 names)
        </h3>

        <div className="space-y-3">
          {names.map((entry, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                placeholder="Full name"
                value={entry.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
              <input
                type="text"
                placeholder="School/Organization"
                value={entry.school}
                onChange={(e) => handleChange(index, 'school', e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
              {names.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < 10 && (
          <button
            type="button"
            onClick={handleAddField}
            className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add another name
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-teal-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Submitting...' : 'Search LinkedIn Profiles'}
      </button>
    </form>
  );
}

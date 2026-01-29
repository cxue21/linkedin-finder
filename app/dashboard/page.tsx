'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { InputName, Job } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ManualJobForm from '@/components/ManualJobForm';
import FileUploadForm from '@/components/FileUploadForm';
import JobList from '@/components/JobList';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

 const fetchJobs = async () => {
  try {
    setLoading(true);
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const response = await fetch('/api/jobs', {
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
    });
    
    const data = await response.json();

    if (response.ok) {
      setJobs(data.jobs || []);  // ✅ Simple, no timeout check
    } else {
      setError(data.error || 'Failed to load jobs');
    }
  } catch (err) {
    setError('Failed to load jobs');
  } finally {
    setLoading(false);
  }
};


  const handleSubmitJob = async (
  names: InputName[],
  inputMethod: 'manual' | 'file_upload'
) => {
  setError('');
  setSubmitting(true);

  try {
    // ✅ Get auth token first
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      setError('Please log in to create jobs');
      setSubmitting(false);
      return;
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,  // ✅ Added
      },
      body: JSON.stringify({ names, inputMethod }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push(`/dashboard/${data.jobId}`);
    } else {
      setError(data.error || 'Failed to submit job');
    }
  } catch (err) {
    setError('Failed to submit job');
  } finally {
    setSubmitting(false);
  }
};


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Search for LinkedIn profiles by name and school
            </p>
          </div>

          {/* Forms Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Manual Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <ManualJobForm onSubmit={handleSubmitJob} isLoading={submitting} />
            </div>

            {/* File Upload Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <FileUploadForm onSubmit={handleSubmitJob} isLoading={submitting} />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 mb-8">
              {error}
            </div>
          )}

          {/* Jobs List */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Past Searches
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : (
              <JobList jobs={jobs} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

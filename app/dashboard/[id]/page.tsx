'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // ✅ Add this
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Job } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResultsTable from '@/components/ResultsTable';
import { formatDate } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase';


export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();  // ✅ Add this
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  // Poll for job status every 2 seconds
  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      fetchJob();
      setPollingCount((c) => c + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [job?.status, jobId]);

  const fetchJob = async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const response = await fetch(`/api/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
    });
      const data = await response.json();

      if (response.ok) {
        setJob(data);
        setLoading(false);
      } else {
        setError(data.error || 'Failed to load job');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load job');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
            <p className="text-red-600">{error}</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Job not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="text-teal-600 hover:text-teal-700 font-medium mb-2 block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Search Results
              </h1>
              <p className="mt-2 text-gray-600">
                {job.input_method === 'manual' ? '📝 Manual Entry' : '📄 File Upload'} •{' '}
                {formatDate(job.created_at)}
              </p>
            </div>

            {/* Status Badge */}
            <div>
            {job.status === 'pending' && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Searching for profiles...</span>
              </div>
            )}

            {job.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <span className="text-xl">❌</span>
                  <span className="font-semibold">Job Failed</span>
                </div>
                {job.error_message && (
                  <p className="text-red-600 text-sm">{job.error_message}</p>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {job.status === 'completed' && (
              <div className="text-green-600 font-semibold">
                ✅ Search Complete
              </div>
            )}


            </div>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Names Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {job.input_names.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Results Found</p>
              <p className="text-2xl font-bold text-gray-900">
                {job.results.filter((r) => r.linkedInUrl).length} / {job.input_names.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {job.results.length > 0
                  ? Math.round(
                      job.results.reduce((sum, r) => sum + r.confidence, 0) /
                        job.results.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Results Table */}
          {job.status === 'completed' ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {job.results.length > 0 ? (
                <ResultsTable results={job.results} />
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No results found
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Searching LinkedIn profiles... (polling: {pollingCount})
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This usually takes 10-30 seconds
              </p>
            </div>
          )}

          {job.error_message && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-red-700 font-medium">Error:</p>
              <p className="text-red-600 text-sm mt-1">{job.error_message}</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

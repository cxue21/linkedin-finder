'use client';

import Link from 'next/link';
import { Job } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">
          No searches yet. Submit a form above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Names
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 text-sm text-gray-900">
                {job.input_names.length} name{job.input_names.length !== 1 ? 's' : ''}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {job.input_method === 'manual' ? '📝 Manual' : '📄 File'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status.charAt(0).toUpperCase() +
                    job.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(job.created_at)}
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  href={`/dashboard/${job.id}`}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  View Results
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

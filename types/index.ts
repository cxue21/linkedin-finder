export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface InputName {
  name: string;
  school: string;
}

export interface JobResult {
  name: string;
  school: string;
  linkedInUrl: string | null;
  confidence: number;
  timestamp?: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  user_id: string;
  status: JobStatus;
  input_method: 'manual' | 'csv';
  input_names: Array<{ name: string; school: string }>;
  results: Array<{
    name: string;
    school: string;
    linkedInUrl: string | null;
    confidence: number;
  }>;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  failed_at?: string | null;
  processing_started_at?: string | null;
}

export interface CreateJobRequest {
  names: InputName[];
  inputMethod: 'manual' | 'file_upload';
}

export interface CreateJobResponse {
  jobId: string;
  status: string;
  inputMethod: string;
  inputNames: InputName[];
  createdAt: string;
}

export interface DraftRequest {
  name: string;
  school: string;
  linkedInUrl: string | null;
  company?: string;      // ADDED
  jobId?: string;        // ADDED
}

export interface DraftResponse {
  draft: string;
  commonalities?: string[];  // ADDED
  error?: string;            // ADDED
  needsProfile?: boolean;    // ADDED
}

export interface N8nWebhookRequest {
  jobId: string;
  results: JobResult[];
  completedAt: string;
}

export interface N8nWebhookResponse {
  success: boolean;
  message: string;
}

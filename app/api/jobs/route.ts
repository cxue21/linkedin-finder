import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateJobRequest } from '@/types';

// Get all jobs for current user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get user's jobs
    const { data: jobs, error } = await supabaseServer
      .from('jobs')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new job
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateJobRequest;
    const { names, inputMethod } = body;

    // Validate input
    if (!names || names.length === 0) {
      return NextResponse.json(
        { error: 'At least one name required' },
        { status: 400 }
      );
    }

    if (names.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 names allowed' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Create job record
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .insert({
        user_id: profile.id,
        status: 'pending',
        input_method: inputMethod,
        input_names: names,
        results: [],
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Mock n8n webhook call (for Phase 1 testing)
    // In Phase 2, replace with real n8n webhook
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (webhookUrl) {
        // Async call - don't wait for response
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-Secret': process.env.N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            jobId: job.id,
            names,
          }),
        }).catch((err) => console.error('n8n webhook error:', err));
      } else {
        // Mock response for local testing
        setTimeout(() => {
          mockN8nResponse(job.id, names);
        }, 3000);
      }
    } catch (err) {
      console.error('Error triggering n8n:', err);
    }

    return NextResponse.json(
      {
        jobId: job.id,
        status: job.status,
        inputMethod: job.input_method,
        inputNames: names,
        createdAt: job.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock n8n response for local testing
async function mockN8nResponse(jobId: string, names: any[]) {
  const mockResults = names.map((item) => ({
    name: item.name,
    school: item.school,
    linkedInUrl: `https://linkedin.com/in/${item.name.toLowerCase().replace(/\s+/g, '')}`,
    confidence: Math.floor(Math.random() * 40) + 60,
  }));

  try {
    await supabaseServer
      .from('jobs')
      .update({
        status: 'completed',
        results: mockResults,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error('Mock response error:', err);
  }
}

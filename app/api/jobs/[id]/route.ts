import { supabaseServer, supabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const jobId = params.id;

    // Get job
    const { data: job, error } = await supabaseServer
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Verify user owns this job
    if (job.user_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Not your job' },
        { status: 403 }
      );
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

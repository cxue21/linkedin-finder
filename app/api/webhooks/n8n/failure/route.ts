// app/api/webhooks/n8n/failure/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // Verify secret
    const secret = req.headers.get('x-n8n-secret');
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      console.error('Unauthorized: Invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await req.json();
    console.log('Failure webhook received:', body);

    // Extract jobId (flexible)
    const jobId = body.jobId || body.execution?.jobId;
    const errorMessage = body.error || body.execution?.error?.message || 'Unknown error';

    if (!jobId) {
      console.error('Missing jobId in payload:', body);
      return NextResponse.json({ 
        error: 'Missing jobId',
        receivedBody: body 
      }, { status: 400 });
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update job to failed
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('Job marked as failed:', jobId);
    return NextResponse.json({ 
      success: true, 
      message: 'Job marked as failed',
      jobId 
    });

  } catch (error: any) {
    console.error('Failure webhook error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// Important: Export a dummy GET to verify route exists
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Failure webhook endpoint is working. Use POST to report failures.',
    method: 'GET'
  });
}

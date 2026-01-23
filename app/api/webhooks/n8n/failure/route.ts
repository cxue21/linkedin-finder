// app/api/webhooks/n8n/failure/route.ts
import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-n8n-secret');
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // ✅ FLEXIBLE: Accept different formats
    const jobId = body.jobId || body.execution?.jobId || null;
    const errorMessage = body.error || body.execution?.error?.message || 'Unknown error';

    console.log('Failure webhook received:', { jobId, errorMessage, body });

    if (!jobId) {
      console.error('No jobId found in payload:', body);
      return NextResponse.json({ 
        error: 'Missing jobId',
        received: body 
      }, { status: 400 });
    }

    // Mark job as failed
    const { error: updateError } = await supabaseServer
      .from('jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update job:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Job marked as failed' });
  } catch (error: any) {
    console.error('Failure webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

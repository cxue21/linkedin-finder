import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== n8n Webhook Received ===');
    const secret = req.headers.get('x-n8n-secret');

    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      console.log('❌ Secret mismatch!');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    // Check if this is a failure callback
    const url = new URL(req.url);
    const isFailure = url.searchParams.get('type') === 'failure';

    const rawBody = await req.text();
    console.log('Raw body received:', rawBody);
    
    if (!rawBody || rawBody.length === 0) {
      console.log('❌ Empty body received!');
      return NextResponse.json(
        { success: false, message: 'Empty request body' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parsed body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Handle FAILURE callback
    if (isFailure) {
      console.log('🔴 Handling FAILURE callback');
      const { jobId, error } = body;
      
      if (!jobId) {
        console.log('❌ Missing jobId in failure callback');
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
      }

      console.log('Marking job as failed:', jobId);

      const { error: updateError } = await supabaseServer
        .from('jobs')
        .update({
          status: 'failed',
          error_message: error || 'Workflow failed',
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { success: false, message: 'Failed to update job' },
          { status: 500 }
        );
      }

      console.log('✅ Job marked as failed successfully');
      return NextResponse.json({ success: true, message: 'Job marked as failed' });
    }

    // Handle SUCCESS callback
    console.log('✅ Handling SUCCESS callback');
    const { jobId, results, completedAt } = body;

    if (!jobId || !results) {
      console.log('❌ Missing fields:', { jobId, results });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Updating job:', jobId);

    const { error } = await supabaseServer
      .from('jobs')
      .update({
        status: 'completed',
        results,
        completed_at: completedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update job' },
        { status: 500 }
      );
    }

    console.log('✅ Job updated successfully');
    return NextResponse.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

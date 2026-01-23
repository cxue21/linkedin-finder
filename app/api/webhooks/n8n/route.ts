import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== n8n Webhook Received ===');
    
    // Check secret first
    const secret = req.headers.get('x-n8n-secret');
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      console.log('❌ Secret mismatch!');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is a failure callback BEFORE parsing body
    const url = new URL(req.url);
    const isFailure = req.headers.get('x-callback-type') === 'failure';
    console.log('Is failure callback?', isFailure);


    // ✅ ADD THESE DEBUG LINES
    console.log('Full URL:', req.url);
    console.log('Query params:', url.searchParams.toString());
    console.log('type param:', url.searchParams.get('type'));
    console.log('Is failure callback?', isFailure);

    // Parse body
    const rawBody = await req.text();
    if (!rawBody || rawBody.length === 0) {
      console.log('❌ Empty body');
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parsed body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // ===== HANDLE FAILURE =====
    if (isFailure) {
      console.log('🔴 Processing FAILURE callback');
      
      const { jobId, error: errorMsg } = body;
      
      if (!jobId) {
        console.log('❌ Missing jobId in failure request');
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
      }

      console.log('Marking job as failed:', jobId, 'Error:', errorMsg);

      const { error: dbError } = await supabaseServer
        .from('jobs')
        .update({
          status: 'failed',
          error_message: errorMsg || 'n8n workflow failed',
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (dbError) {
        console.error('❌ DB error:', dbError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      console.log('✅ Job marked as failed successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Job marked as failed',
        jobId 
      });
    }

    // ===== HANDLE SUCCESS =====
    console.log('✅ Processing SUCCESS callback');
    
    const { jobId, results, completedAt } = body;

    if (!jobId || !results) {
      console.log('❌ Missing required fields for success:', { 
        hasJobId: !!jobId, 
        hasResults: !!results 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Updating job as completed:', jobId);

    const { error: dbError } = await supabaseServer
      .from('jobs')
      .update({
        status: 'completed',
        results,
        completed_at: completedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (dbError) {
      console.error('❌ DB error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ Job completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Job updated successfully',
      jobId 
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

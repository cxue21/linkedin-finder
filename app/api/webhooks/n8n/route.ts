import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== n8n Webhook Received ===');
    const secret = req.headers.get('x-n8n-secret');

    console.log('Received secret:', secret);
    console.log('Expected secret:', process.env.N8N_CALLBACK_SECRET);
    
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      console.log('❌ Secret mismatch!');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    // --- ADD THIS DEBUG SECTION ---
    const rawBody = await req.text(); // Get raw text first
    console.log('Raw body received:', rawBody);
    console.log('Raw body length:', rawBody.length);
    
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
      console.log('Failed to parse:', rawBody.substring(0, 200)); // First 200 chars
      return NextResponse.json(
        { success: false, message: 'Invalid JSON' },
        { status: 400 }
      );
    }
    // --- END DEBUG SECTION ---

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
    return NextResponse.json(
      { success: true, message: 'Job updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { N8nWebhookRequest, N8nWebhookResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<N8nWebhookResponse>> {
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

    const body = (await req.json()) as N8nWebhookRequest;
    console.log('Body received:', JSON.stringify(body, null, 2));

    const { jobId, results, completedAt } = body;

    if (!jobId || !results) {
      console.log('❌ Missing fields:', { jobId, results });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Updating job:', jobId);

    // Update job with results
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

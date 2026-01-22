import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { N8nWebhookRequest, N8nWebhookResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<N8nWebhookResponse>> {
  try {
    // TEMPORARY: Disable auth for debugging
    // const secret = req.headers.get('x-n8n-secret');
    // if (secret !== process.env.N8N_CALLBACK_SECRET) {
    //   return NextResponse.json(
    //     { success: false, message: 'Invalid webhook secret' },
    //     { status: 401 }
    //   );
    // }

    console.log('Webhook received!', await req.json()); // Add logging

    const body = (await req.json()) as N8nWebhookRequest;
    const { jobId, results, completedAt } = body;

    if (!jobId || !results) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

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

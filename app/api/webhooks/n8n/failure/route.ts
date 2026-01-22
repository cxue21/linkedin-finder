import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-n8n-secret');
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, error } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    // Mark job as failed
    await supabaseServer
      .from('jobs')
      .update({
        status: 'failed',
        error_message: error || 'n8n workflow failed',
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failure webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

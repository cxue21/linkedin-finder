console.log('FAILURE ROUTE LOADED');

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-n8n-secret');
    
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const jobId = body.jobId;
    const errorMessage = body.error || 'Workflow failed';

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
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

export async function GET() {
  return NextResponse.json({ 
    message: 'Failure webhook is working',
    timestamp: new Date().toISOString()
  });
}// Updated Fri Jan 23 17:59:56 HKT 2026

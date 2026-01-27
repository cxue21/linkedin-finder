import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    const { error } = await supabaseServer
      .from('jobs')
      .update({
        status: 'failed',
        error_message: 'Job timed out after 10 minutes',
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

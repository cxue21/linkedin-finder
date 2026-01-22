import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Vercel sends: authorization: Bearer <CRON_SECRET>
    const authHeader = req.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Cron auth failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeoutMinutes = 10;
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();

    const { data: stuckJobs, error } = await supabaseServer
      .from('jobs')
      .select('id, processing_started_at')
      .in('status', ['pending', 'processing'])
      .lt('processing_started_at', cutoffTime);

    if (error) {
      console.error('Error fetching stuck jobs:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (stuckJobs && stuckJobs.length > 0) {
      const jobIds = stuckJobs.map((j) => j.id);
      
      await supabaseServer
        .from('jobs')
        .update({
          status: 'failed',
          error_message: `Job timed out after ${timeoutMinutes} minutes`,
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', jobIds);

      console.log(`✅ Marked ${jobIds.length} jobs as failed`);
    }

    return NextResponse.json({ 
      success: true, 
      timedOutJobs: stuckJobs?.length || 0 
    });
  } catch (error: any) {
    console.error('Timeout checker error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

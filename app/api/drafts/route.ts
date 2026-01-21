import { NextRequest, NextResponse } from 'next/server';
import type { DraftRequest, DraftResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<DraftResponse>> {
  try {
    const body = (await req.json()) as DraftRequest;
    const { name, school } = body;

    if (!name || !school) {
      return NextResponse.json(
        { draft: '' },
        { status: 400 }
      );
    }

    // MVP: Hardcoded template
    const template = `Hi ${name}, I came across your profile and noticed you also attended ${school}. I'm [Your Name], and I'd love to connect and learn about your experience. Would love to chat sometime!`;

    // In Phase 2, replace with actual DeepSeek API call:
    // const response = await fetch('https://api.deepseek.com/...', {
    //   headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    //   body: JSON.stringify({ prompt: ... })
    // });

    return NextResponse.json(
      { draft: template },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/drafts error:', error);
    return NextResponse.json(
      { draft: '' },
      { status: 500 }
    );
  }
}

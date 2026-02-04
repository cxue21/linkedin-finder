import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { DraftRequest, DraftResponse } from '@/types';

// Create Supabase client for server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server
);

export async function POST(req: NextRequest): Promise<NextResponse<DraftResponse>> {
  try {
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { draft: '', error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify user with token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { draft: '', error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as DraftRequest;
    const { name, school, company, jobId } = body;

    if (!name || !school) {
      return NextResponse.json(
        { draft: '', error: 'Name and school are required' },
        { status: 400 }
      );
    }

    // Fetch sender's profile AND full name
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('sender_profile, full_name')  // ✅ Include full_name
      .eq('user_id', user.id)
      .single();

    const senderProfile = profileData?.sender_profile || {};
    const senderFullName = profileData?.full_name || 
      user.user_metadata?.full_name || 
      user.email?.split('@')[0] || 
      'User';

    // Check if user has set up their profile
    if (!senderProfile.education && !senderProfile.current_role) {
      return NextResponse.json({
        draft: '', 
        error: 'Please add your profile in Settings first to generate personalized messages',
        needsProfile: true 
      }, { status: 400 });
    }

    // Find commonalities
    const commonalities: string[] = [];

    // 1. Education match (HIGHEST PRIORITY)
    if (senderProfile.education && Array.isArray(senderProfile.education)) {
      const matchingSchool = senderProfile.education.find(
        (senderSchool: string) => 
          senderSchool.toLowerCase().trim() === school.toLowerCase().trim()
      );
      if (matchingSchool) {
        commonalities.push(`Both attended ${matchingSchool}`);
      }
    }

    // 2. Company match (if recipient company provided)
    if (company && senderProfile.experience && Array.isArray(senderProfile.experience)) {
      const matchingCompany = senderProfile.experience.find(
        (senderCompany: string) => 
          senderCompany.toLowerCase().trim() === company.toLowerCase().trim()
      );
      if (matchingCompany) {
        commonalities.push(`Both have experience at ${matchingCompany}`);
      }
    }

    // Generate message with sender's REAL full name
    const message = await generateLinkedInMessage({
      senderName: senderFullName,  // ✅ Now uses "Cindy Xue" from Settings
      senderCompany: senderProfile.current_company,
      senderTitle: senderProfile.current_role,
      senderInterests: senderProfile.interests?.slice(0, 3).join(', '),
      recipientName: name,
      recipientSchool: school,
      recipientCompany: company,
      commonalities,
      tone: 'professional'
    });



    // Optional: Store message in job if jobId provided
    if (jobId) {
      try {
        const { data: job } = await supabaseAdmin
          .from('jobs')
          .select('generated_messages')
          .eq('id', jobId)
          .single();

        const messages = job?.generated_messages || [];
        messages.push({
          recipientName: name,
          recipientSchool: school,
          recipientCompany: company,
          message,
          commonalities,
          generatedAt: new Date().toISOString()
        });

        await supabaseAdmin
          .from('jobs')
          .update({ generated_messages: messages })
          .eq('id', jobId);
      } catch (storageError) {
        console.error('Failed to store message:', storageError);
      }
    }

    return NextResponse.json(
      { 
        draft: message,
        commonalities 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/drafts error:', error);
    return NextResponse.json(
      { 
        draft: '', 
        error: error instanceof Error ? error.message : 'Failed to generate message' 
      },
      { status: 500 }
    );
  }
}

// ===== DeepSeek Integration =====

interface MessageContext {
  senderName: string;
  senderCompany?: string;
  senderTitle?: string;
  senderInterests?: string;
  recipientName: string;
  recipientSchool: string;
  recipientCompany?: string;
  commonalities: string[];
  tone?: 'professional' | 'friendly';
}

async function generateLinkedInMessage(context: MessageContext): Promise<string> {
  const prompt = buildPrompt(context);

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a professional LinkedIn message writer. Generate short, structured, personalized connection requests that highlight only real, verified commonalities. Keep messages under 500 characters. Never use emojis or casual slang.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function buildPrompt(context: MessageContext): string {
  const {
    senderName,
    senderCompany,
    senderTitle,
    senderInterests,
    recipientName,
    recipientSchool,
    recipientCompany,
    commonalities,
  } = context;

  const firstName = recipientName.split(' ')[0];

  let prompt = `ALWAYS start with: "Hi ${firstName}, I'm ${senderName}, a ${senderTitle} at ${senderCompany}."\n\n`;

  prompt += `CONTEXT:\n`;
  prompt += `- You: ${senderTitle} @ ${senderCompany}, interests: ${senderInterests || 'your field'}\n`;
  prompt += `- Them: ${recipientName} (${recipientSchool}${recipientCompany ? `, ${recipientCompany}` : ''})\n`;
  
  if (commonalities.length > 0) {
    prompt += `- ✅ ONLY verified commonalities: ${commonalities.join('; ')}\n`;
  } else {
    prompt += `- ⚠️ NO verified commonalities\n`;
  }
  
  prompt += `\nRULES (CRITICAL):\n`;
  prompt += `1. EXACT opening: "Hi ${firstName}, I'm ${senderName}, a ${senderTitle} at ${senderCompany}."\n`;
  prompt += `2. NO "fellow alumni" or "fellow [school]" UNLESS ${recipientSchool} is in verified commonalities\n`;
  prompt += `3. 3 sentences total:\n`;
  prompt += `   a) Reference ${recipientSchool} connection (don't claim you attended it)\n`;
  prompt += `   b) Mention why their work interests you\n`;
  prompt += `   c) Professional CTA: "Would you be open to connecting?"\n`;
  prompt += `4. End: "Best regards, ${senderName}"\n`;
  prompt += `5. 200-280 chars\n\n`;

  prompt += `EXAMPLE (different schools):\n`;
  prompt += `"Hi Sarah, I'm Cindy Xue, a Product Manager at ByteDance.\n\n`;
  prompt += `Reaching out to CityU alumni doing impressive work in tech. Your background at Meta caught my attention.\n\n`;
  prompt += `Would you be open to connecting?\n\n`;
  prompt += `Best regards,\n`;
  prompt += `Cindy Xue"\n\n`;

  prompt += `Generate for ${firstName}:`;

  return prompt;
}

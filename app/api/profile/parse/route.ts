import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIXED: Get BOTH profileText AND userName from request
    const { profileText, userName } = await req.json();
    
    if (!profileText || profileText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Profile text too short. Please provide at least 50 characters.' },
        { status: 400 }
      );
    }

    // Call DeepSeek to extract structured data
    const profile = await extractProfileWithDeepSeek(profileText);

    // Save to database
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        sender_profile: profile,
        profile_raw_text: profileText,
        full_name: userName || '',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save profile');
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    });

  } catch (error: any) {
    console.error('Profile parsing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse profile' },
      { status: 500 }
    );
  }
}

// ✅ RE-ADDED: The missing function!
async function extractProfileWithDeepSeek(profileText: string) {
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
          content: `You are a data extraction assistant. Extract professional profile information from the given text and return ONLY valid JSON with no additional text or markdown formatting.

Return a JSON object with these exact keys:
- education: array of school/university names
- experience: array of company names (past and present)
- current_company: string (most recent company, or empty string)
- current_role: string (most recent job title, or empty string)
- interests: array of skills, interests, or focus areas (5-10 items)

Example output:
{
  "education": ["University of Hong Kong", "MIT"],
  "experience": ["Google", "Stripe", "Startup Inc"],
  "current_company": "Startup Inc",
  "current_role": "Product Manager",
  "interests": ["AI", "B2B SaaS", "product management", "developer tools", "machine learning"]
}`
        },
        {
          role: 'user',
          content: `Extract profile data from this text:\n\n${profileText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // Remove markdown code blocks if present
  content = content.replace(/^```json\n?/i, '').replace(/\n?```$/, '');
  content = content.trim();

  try {
    const profile = JSON.parse(content);
    
    // Validate structure
    return {
      education: Array.isArray(profile.education) ? profile.education : [],
      experience: Array.isArray(profile.experience) ? profile.experience : [],
      current_company: profile.current_company || '',
      current_role: profile.current_role || '',
      interests: Array.isArray(profile.interests) ? profile.interests : []
    };
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Content received:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

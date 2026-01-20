import { supabaseServer } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create profile record
    if (data.user) {
      await supabaseServer.from('profiles').insert({
        user_id: data.user.id,
        email: data.user.email,
      });
    }

    return NextResponse.json(
      { message: 'User created successfully', user: data.user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

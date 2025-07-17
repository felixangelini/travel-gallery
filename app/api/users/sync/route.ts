import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';

// POST /api/users/sync - Sync user with database
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, username } = await request.json();

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id }
    });

    if (!dbUser) {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          supabaseUserId: user.id,
          email: email || user.email || '',
          username: username || null
        }
      });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' }, 
      { status: 500 }
    );
  }
} 
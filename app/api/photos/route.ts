import { NextRequest, NextResponse } from 'next/server';
import { PrismaPhotoService } from '@/lib/services/prisma-photo-service';
import { CreatePhotoData } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

// GET /api/photos - Get all photos for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photos = await PrismaPhotoService.getPhotos(user.id);
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' }, 
      { status: 500 }
    );
  }
}

// POST /api/photos - Create a new photo
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

    const photoData: CreatePhotoData = await request.json();
    const photo = await PrismaPhotoService.createPhoto(photoData, user.id);
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' }, 
      { status: 500 }
    );
  }
} 
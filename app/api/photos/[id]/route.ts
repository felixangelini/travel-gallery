import { NextRequest, NextResponse } from 'next/server';
import { PrismaPhotoService } from '@/lib/services/prisma-photo-service';
import { UpdatePhotoData } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

// GET /api/photos/[id] - Get a single photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photo = await PrismaPhotoService.getPhoto(id, user.id);
    
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' }, 
      { status: 500 }
    );
  }
}

// PUT /api/photos/[id] - Update a photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photoData: UpdatePhotoData = await request.json();
    const photo = await PrismaPhotoService.updatePhoto(id, photoData, user.id);
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await PrismaPhotoService.deletePhoto(id, user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' }, 
      { status: 500 }
    );
  }
} 
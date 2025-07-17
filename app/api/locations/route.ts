import { NextRequest, NextResponse } from 'next/server';
import { PrismaLocationService } from '@/lib/services/prisma-location-service';
import { createClient } from '@/lib/supabase/server';

// GET /api/locations - Get all locations
export async function GET() {
  try {
    const locations = await PrismaLocationService.getAllLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' }, 
      { status: 500 }
    );
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    const location = await PrismaLocationService.createLocation(name);
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' }, 
      { status: 500 }
    );
  }
} 
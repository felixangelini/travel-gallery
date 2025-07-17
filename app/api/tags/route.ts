import { NextRequest, NextResponse } from 'next/server';
import { PrismaTagService } from '@/lib/services/prisma-tag-service';

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await PrismaTagService.getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' }, 
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const tag = await PrismaTagService.createTag(name);
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' }, 
      { status: 500 }
    );
  }
} 
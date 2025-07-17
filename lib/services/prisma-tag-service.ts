import { prisma } from '@/lib/prisma/client';
import { Tag } from '@/lib/types';

export class PrismaTagService {
  // Get all tags
  static async getAllTags(): Promise<Tag[]> {
    try {
      // Ensure database connection
      await prisma.$connect();
      
      const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' }
      });

      return tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        created_at: tag.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Prisma getAllTags error:', error);
      
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('timeout')) {
          throw new Error('Database connection failed. Please try again later.');
        }
      }
      
      throw new Error(`Error fetching tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new tag
  static async createTag(name: string): Promise<Tag> {
    try {
      const tag = await prisma.tag.create({
        data: { name }
      });

      return {
        id: tag.id,
        name: tag.name,
        created_at: tag.createdAt.toISOString()
      };
    } catch (error) {
      throw new Error(`Error creating tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a tag
  static async updateTag(id: string, name: string): Promise<Tag> {
    try {
      const tag = await prisma.tag.update({
        where: { id },
        data: { name }
      });

      return {
        id: tag.id,
        name: tag.name,
        created_at: tag.createdAt.toISOString()
      };
    } catch (error) {
      throw new Error(`Error updating tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a tag
  static async deleteTag(id: string): Promise<void> {
    try {
      // First delete all photo-tag connections
      await prisma.photoTag.deleteMany({
        where: { tagId: id }
      });

      // Then delete the tag
      await prisma.tag.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Error deleting tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
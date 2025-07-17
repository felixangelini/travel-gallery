import { prisma } from '@/lib/prisma/client';
import { CreatePhotoData, UpdatePhotoData, TravelPhoto, PrismaTravelPhoto } from '@/lib/types';

export class PrismaPhotoService {
  // Get all photos for a user
  static async getPhotos(supabaseUserId: string): Promise<TravelPhoto[]> {
    try {
      // First get the user by supabaseUserId
      const user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        console.log('User not found for supabaseUserId:', supabaseUserId);
        return [];
      }

      const photos = await prisma.travelPhoto.findMany({
        where: { userId: user.id },
        include: {
          photoTags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return photos.map(photo => this.mapPrismaPhotoToTravelPhoto(photo));
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw new Error(`Error fetching photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a single photo by ID
  static async getPhoto(id: string, supabaseUserId: string): Promise<TravelPhoto | null> {
    try {
      // First get the user by supabaseUserId
      const user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        console.log('User not found for supabaseUserId:', supabaseUserId);
        return null;
      }

      const photo = await prisma.travelPhoto.findFirst({
        where: { id, userId: user.id },
        include: {
          photoTags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!photo) return null;

      return this.mapPrismaPhotoToTravelPhoto(photo);
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw new Error(`Error fetching photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new photo
  static async createPhoto(photoData: CreatePhotoData, supabaseUserId: string): Promise<TravelPhoto> {
    try {
      // Get user from database (should already exist due to sync)
      const user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        throw new Error(`User not found for supabaseUserId: ${supabaseUserId}. Please try logging out and back in.`);
      }
      
      const photo = await prisma.travelPhoto.create({
        data: {
          title: photoData.title,
          description: photoData.description || null,
          imageUrl: photoData.image_url,
          location: photoData.location || null,
          dateTaken: photoData.date_taken ? new Date(photoData.date_taken) : null,
          userId: user.id,
          photoTags: photoData.tags && photoData.tags.length > 0 ? {
            create: await this.createTagConnections(photoData.tags)
          } : undefined
        },
        include: {
          photoTags: {
            include: {
              tag: true
            }
          }
        }
      });

      return this.mapPrismaPhotoToTravelPhoto(photo);
    } catch (error) {
      console.error('Prisma createPhoto error details:', error);
      throw new Error(`Error creating photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a photo
  static async updatePhoto(id: string, photoData: UpdatePhotoData, supabaseUserId: string): Promise<TravelPhoto> {
    try {
      // First get the user by supabaseUserId
      const user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        throw new Error(`User not found for supabaseUserId: ${supabaseUserId}`);
      }

      // First, remove existing tag connections
      await prisma.photoTag.deleteMany({
        where: { photoId: id }
      });

      const photo = await prisma.travelPhoto.update({
        where: { id, userId: user.id },
        data: {
          title: photoData.title,
          description: photoData.description || null,
          imageUrl: photoData.image_url,
          location: photoData.location || null,
          dateTaken: photoData.date_taken ? new Date(photoData.date_taken) : null,
          photoTags: photoData.tags && photoData.tags.length > 0 ? {
            create: await this.createTagConnections(photoData.tags)
          } : undefined
        },
        include: {
          photoTags: {
            include: {
              tag: true
            }
          }
        }
      });

      return this.mapPrismaPhotoToTravelPhoto(photo);
    } catch (error) {
      console.error('Error updating photo:', error);
      throw new Error(`Error updating photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a photo
  static async deletePhoto(id: string, supabaseUserId: string): Promise<void> {
    try {
      // First get the user by supabaseUserId
      const user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        throw new Error(`User not found for supabaseUserId: ${supabaseUserId}`);
      }

      await prisma.travelPhoto.delete({
        where: { id, userId: user.id }
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error(`Error deleting photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to map Prisma photo to TravelPhoto
  private static mapPrismaPhotoToTravelPhoto(photo: PrismaTravelPhoto): TravelPhoto {
    return {
      id: photo.id,
      title: photo.title,
      description: photo.description || undefined,
      image_url: photo.imageUrl,
      location: photo.location || undefined,
      date_taken: photo.dateTaken?.toISOString().split('T')[0] || undefined,
      created_at: photo.createdAt.toISOString(),
      updated_at: photo.updatedAt.toISOString(),
      user_id: photo.userId,
      tags: photo.photoTags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        created_at: pt.tag.createdAt.toISOString()
      }))
    };
  }

  // Helper method to create tag connections
  private static async createTagConnections(tagNames: string[]) {
    const connections = [];
    
    for (const tagName of tagNames) {
      try {
        // Get or create tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName }
          });
        }

        connections.push({
          tagId: tag.id
        });
      } catch (error) {
        console.error('Error processing tag:', tagName, error);
        throw error;
      }
    }

    return connections;
  }
} 
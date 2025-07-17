import { prisma } from '@/lib/prisma/client';
import { Location } from '@/lib/types';

export class PrismaLocationService {
  // Get all locations
  static async getAllLocations(): Promise<Location[]> {
    try {
      const locations = await prisma.location.findMany({
        orderBy: { name: 'asc' }
      });

      return locations.map(location => ({
        id: location.id,
        name: location.name,
        created_at: location.createdAt.toISOString()
      }));
    } catch (error) {
      throw new Error(`Error fetching locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new location
  static async createLocation(name: string): Promise<Location> {
    try {
      const location = await prisma.location.create({
        data: { name }
      });

      return {
        id: location.id,
        name: location.name,
        created_at: location.createdAt.toISOString()
      };
    } catch (error) {
      throw new Error(`Error creating location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a location
  static async updateLocation(id: string, name: string): Promise<Location> {
    try {
      const location = await prisma.location.update({
        where: { id },
        data: { name }
      });

      return {
        id: location.id,
        name: location.name,
        created_at: location.createdAt.toISOString()
      };
    } catch (error) {
      throw new Error(`Error updating location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a location
  static async deleteLocation(id: string): Promise<void> {
    try {
      // Update all photos that reference this location to set location to null
      await prisma.travelPhoto.updateMany({
        where: { location: { equals: id } },
        data: { location: null }
      });

      // Then delete the location
      await prisma.location.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Error deleting location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
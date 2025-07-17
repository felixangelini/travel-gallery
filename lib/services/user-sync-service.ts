import { prisma } from '@/lib/prisma/client';

export class UserSyncService {
  // Sync a single user from Supabase to Prisma
  static async syncUser(supabaseUserId: string, email: string, username?: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (existingUser) {
        console.log('User already exists:', existingUser.id);
        return existingUser;
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          supabaseUserId
        }
      });

      console.log('User created:', user.id);
      return user;
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  }

  // Get or create user by Supabase ID
  static async getOrCreateUser(supabaseUserId: string, email: string, username?: string) {
    try {
      // First try to find by supabaseUserId
      let user = await prisma.user.findUnique({
        where: { supabaseUserId }
      });

      if (!user) {
        // Try to find by email
        user = await prisma.user.findUnique({
          where: { email }
        });

        if (user) {
          // Update existing user with supabaseUserId
          user = await prisma.user.update({
            where: { id: user.id },
            data: { supabaseUserId }
          });
        } else {
          // Create new user
          user = await this.syncUser(supabaseUserId, email, username);
        }
      }

      return user;
    } catch (error) {
      console.error('Error getting or creating user:', error);
      throw error;
    }
  }
} 
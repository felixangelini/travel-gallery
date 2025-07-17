export interface TravelPhoto {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url: string;
  location?: string;
  date_taken?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  created_at: string;
}

export interface PhotoTag {
  photo_id: string;
  tag_id: string;
}

export interface CreatePhotoData {
  title: string;
  description?: string;
  image_url: string; // Required for creation
  location?: string;
  date_taken?: string;
  tags?: string[];
}

export interface UpdatePhotoData {
  title?: string;
  description?: string;
  image_url?: string;
  location?: string;
  date_taken?: string;
  tags?: string[];
}

// Prisma-specific types for better type safety
export interface PrismaTravelPhoto {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  location: string | null;
  dateTaken: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  photoTags: Array<{
    tag: {
      id: string;
      name: string;
      createdAt: Date;
    };
  }>;
} 
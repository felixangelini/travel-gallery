'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/hooks';
import { PhotoCard } from './photo-card';
import { ConfirmDialog } from './confirm-dialog';
import { toast } from 'sonner';
import { TravelPhoto } from '@/lib/types';
import { useApi } from '@/lib/hooks';

interface PhotoGridProps {
  photos: TravelPhoto[];
  onPhotoDeleted: () => void;
}

export function PhotoGrid({ photos, onPhotoDeleted }: PhotoGridProps) {
  const { client, user } = useSupabase();
  const { deleteData } = useApi();
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    photo: TravelPhoto | null;
  }>({ open: false, photo: null });

  const deletePhotoRecord = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await deleteData(`/api/photos/${id}`);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error deleting photo');
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fullPath = `${user.id}/${fileName}`;

      const { error } = await client.storage
        .from('travel-photos')
        .remove([fullPath]);

      if (error) throw error;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error deleting image');
    }
  };

  const handleDeletePhoto = (photo: TravelPhoto) => {
    setConfirmDialog({ open: true, photo });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.photo) return;
    
    const deletePromise = async () => {
      setDeletingPhotoId(confirmDialog.photo!.id);
      try {
        await deleteImage(confirmDialog.photo!.image_url);
        await deletePhotoRecord(confirmDialog.photo!.id);
        onPhotoDeleted();
        return 'Photo deleted successfully';
      } catch (error) {
        console.error('Error deleting photo:', error);
        throw new Error('Error during photo deletion');
      } finally {
        setDeletingPhotoId(null);
      }
    };

    toast.promise(deletePromise(), {
      loading: 'Deleting photo...',
      success: (message) => message,
      error: (error) => error.message,
    });
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          You haven&apos;t uploaded any travel photos yet
        </div>
        <p className="text-gray-400">
          Start documenting your memories by uploading your first photo!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onDelete={handleDeletePhoto}
            deleting={deletingPhotoId === photo.id}
          />
        ))}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, photo: null })}
        title="Delete photo"
        description={`Are you sure you want to delete the photo "${confirmDialog.photo?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        loading={deletingPhotoId === confirmDialog.photo?.id}
        variant="destructive"
      />
    </>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { PhotoGrid } from '@/components/photo-grid';
import { UploadDrawer } from '@/components/upload-drawer';
import { TravelPhoto, Tag } from '@/lib/types';
import { parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { Filters } from './_components/filters';
import { useSupabase, useApi } from '@/lib/hooks';

export default function GalleryPage() {
  const { user } = useSupabase();
  const { fetchData, postData } = useApi();
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Helper function to format date from ISO to DD/MM/YYYY
  const formatDateForDisplay = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString; // fallback to original string if parsing fails
    }
  };

  const loadPhotos = async () => {
    if (!user) return;

    try {
      const photosData = await fetchData<TravelPhoto[]>('/api/photos');
      setPhotos(photosData);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await fetchData<Tag[]>('/api/tags');
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };



  useEffect(() => {
    if (user) {
      // Sync user to database first
      const syncUser = async () => {
        try {
          await postData('/api/users/sync', {
            email: user.email || '',
            username: user.user_metadata?.username
          });
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      };

      syncUser();
      loadPhotos();
      loadTags();
    }
  }, [user]);

  const handlePhotoUploaded = () => {
    loadPhotos();
    loadTags();
    setIsDrawerOpen(false);
  };

  const handlePhotoDeleted = () => {
    loadPhotos();
  };

  const filteredPhotos = photos.filter(photo => {
    // Filtro per tag
    if (selectedTag && !photo.tags?.some(tag => tag.name === selectedTag)) {
      return false;
    }

    // Filtro per località
    if (selectedLocation && photo.location !== selectedLocation) {
      return false;
    }

    // Filtro per data
    if (dateFrom || dateTo) {
      if (!photo.date_taken) return false;
      
      const photoDate = parseISO(photo.date_taken);
      const fromDate = dateFrom ? startOfDay(parseISO(dateFrom)) : null;
      const toDate = dateTo ? endOfDay(parseISO(dateTo)) : null;

      if (fromDate && toDate) {
        return isWithinInterval(photoDate, { start: fromDate, end: toDate });
      } else if (fromDate) {
        return photoDate >= fromDate;
      } else if (toDate) {
        return photoDate <= toDate;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-300 mb-2">
            Travel Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Document and relive your travel memories
          </p>
        </div>
        
        <UploadDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onPhotoUploaded={handlePhotoUploaded}
          availableTags={tags}
          onTagsUpdated={loadTags}
        />
      </div>



      {/* Filters */}
      <Filters
        tags={tags}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      

      {/* Photo Grid */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
            {selectedTag || selectedLocation || dateFrom || dateTo 
              ? `Filtered photos${selectedTag ? ` (tag: "${selectedTag}")` : ''}${selectedLocation ? ` (location: "${selectedLocation}")` : ''}${dateFrom || dateTo ? ` (Date: ${dateFrom ? formatDateForDisplay(dateFrom) : ''}${dateFrom && dateTo ? ' - ' : ''}${dateTo ? formatDateForDisplay(dateTo) : ''})` : ''}`
              : 'Your photos'
            }
          </h2>
          <span className="text-gray-500">
            {filteredPhotos.length} photos
          </span>
        </div>
        
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoDeleted={handlePhotoDeleted}
        />
      </div>
    </div>
  );
} 
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase } from '@/lib/hooks';
import { CreatePhotoData, Tag } from '@/lib/types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { LocationDropdown } from './location-dropdown';
import { DatePicker } from './date-picker';

import Image from 'next/image';
import { toast } from 'sonner';
import { useApi } from '@/lib/hooks';

interface UploadPhotoFormProps {
  onPhotoUploaded: () => void;
  availableTags: Tag[];
  onTagsUpdated?: () => void;
}

interface PhotoFormData {
  file: File;
  previewUrl: string;
  data: CreatePhotoData;
  isUploading: boolean;
  error?: string;
}

export function UploadPhotoForm({ onPhotoUploaded, availableTags, onTagsUpdated }: UploadPhotoFormProps) {
  const { client, user } = useSupabase();
  const { postData } = useApi();
  const [photoForms, setPhotoForms] = useState<PhotoFormData[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [localTags, setLocalTags] = useState<Tag[]>(availableTags);

  // Update local tags when available tags change
  useState(() => {
    setLocalTags(availableTags);
  });

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      // Upload file
      const { error } = await client.storage
        .from('travel-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = client.storage
        .from('travel-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error uploading image');
    }
  };

  const createPhotoRecord = async (photoData: CreatePhotoData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create photo using API
      const photo = await postData('/api/photos', photoData);
      return photo;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creating photo');
    }
  };



  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const newPhotoForms: PhotoFormData[] = fileArray.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Use file name as default title
        description: '',
        image_url: '',
        location: '',
        date_taken: '',
        tags: []
      },
      isUploading: false
    }));

    setPhotoForms(prev => [...prev, ...newPhotoForms]);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removePhotoForm = (index: number) => {
    setPhotoForms(prev => {
      const newForms = [...prev];
      // Check if element exists before accessing it
      if (newForms[index] && newForms[index].previewUrl) {
        URL.revokeObjectURL(newForms[index].previewUrl); // Free memory
      }
      newForms.splice(index, 1);
      return newForms;
    });
  };

  const updatePhotoForm = (index: number, field: keyof CreatePhotoData, value: string | string[]) => {
    setPhotoForms(prev => {
      const newForms = [...prev];
      newForms[index] = {
        ...newForms[index],
        data: {
          ...newForms[index].data,
          [field]: value
        }
      };
      return newForms;
    });
  };

  const addTagToPhoto = (photoIndex: number, tagName: string) => {
    const currentTags = photoForms[photoIndex].data.tags || [];
    if (!currentTags.includes(tagName)) {
      updatePhotoForm(photoIndex, 'tags', [...currentTags, tagName]);
    }
  };

  const removeTagFromPhoto = (photoIndex: number, tagToRemove: string) => {
    const currentTags = photoForms[photoIndex].data.tags || [];
    updatePhotoForm(photoIndex, 'tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const addNewTag = async () => {
    if (newTagInput.trim() && !localTags.find(tag => tag.name === newTagInput.trim())) {
      try {
        const newTag = await postData<Tag>('/api/tags', { name: newTagInput.trim() });
        setLocalTags(prev => [...prev, newTag]);
        setNewTagInput('');
        toast.success(`Tag "${newTagInput.trim()}" created successfully`);

        // Update tags list in parent component
        if (onTagsUpdated) {
          onTagsUpdated();
        }
      } catch (error) {
        console.error('Error creating tag:', error);
        toast.error('Error creating tag');
      }
    }
  };

  const uploadSinglePhoto = async (photoForm: PhotoFormData, index: number): Promise<boolean> => {
    try {
      // Upload image
      const imageUrl = await uploadImage(photoForm.file);

      // Create photo record
      await createPhotoRecord({
        ...photoForm.data,
        image_url: imageUrl
      });

      return true;
    } catch (error) {
      console.error(`Error uploading photo ${index + 1}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error during upload';
      
      setPhotoForms(prev => {
        const newForms = [...prev];
        newForms[index] = {
          ...newForms[index],
          error: errorMessage
        };
        return newForms;
      });
      
      toast.error(`Error uploading "${photoForm.data.title}": ${errorMessage}`);
      return false;
    }
  };

  const handleUploadAll = async () => {
    if (photoForms.length === 0) return;

    // Validate required fields
    const invalidForms = photoForms.filter(form => 
      !form.data.title.trim() || !form.data.date_taken?.trim()
    );

    if (invalidForms.length > 0) {
      toast.error('All photos must have a title and selected date');
      return;
    }

    setIsUploadingAll(true);
    let successCount = 0;
    const successfulIndices: number[] = [];

    // Upload photos sequentially to avoid overwhelming the server
    for (let i = 0; i < photoForms.length; i++) {
      const photoForm = photoForms[i];
      
      // Skip if already has error
      if (photoForm.error) continue;

      // Mark as uploading
      setPhotoForms(prev => {
        const newForms = [...prev];
        newForms[i] = { ...newForms[i], isUploading: true };
        return newForms;
      });

      const success = await uploadSinglePhoto(photoForm, i);
      
      if (success) {
        successCount++;
        successfulIndices.push(i);
      }

      // Mark as not uploading
      setPhotoForms(prev => {
        const newForms = [...prev];
        newForms[i] = { ...newForms[i], isUploading: false };
        return newForms;
      });
    }

    setIsUploadingAll(false);

    if (successCount > 0) {
      // Remove successful photos from the form
      setPhotoForms(prev => prev.filter((_, index) => !successfulIndices.includes(index)));
      
      // Clean up preview URLs for successful uploads
      successfulIndices.forEach(index => {
        if (photoForms[index] && photoForms[index].previewUrl) {
          URL.revokeObjectURL(photoForms[index].previewUrl);
        }
      });

      toast.success(`${successCount} photos uploaded successfully!`);
      onPhotoUploaded();
    }

    if (successCount < photoForms.length) {
      toast.error(`${photoForms.length - successCount} photos were not uploaded. Check the errors.`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload your travel photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag & Drop Area */}
        <div className="space-y-2">
          <Label>Select images</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center gap-4">
              <ImageIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium mb-1">
                  {isDragOver ? 'Drop images here' : 'Drag images here'}
                </p>
                <p className="text-xs text-gray-500">
                  or click to select
                </p>
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>
        </div>

        {/* Global Tag Management */}
        <div className="space-y-2">
          <Label>Add new global tag</Label>
          <div className="flex gap-2">
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Write a new tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
            />
            <Button onClick={() => addNewTag()} variant="outline">
              Add
            </Button>
          </div>
        </div>

        {/* Photo Forms */}
        {photoForms.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Selected photos ({photoForms.length})
              </h3>
            </div>

            <div className="grid gap-4">
              {photoForms.map((photoForm, index) => (
                photoForm && (
                  <Card key={index} className="border-2">
                                      <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image Preview */}
                      <div className="relative flex-shrink-0">
                        <Image
                          src={photoForm.previewUrl}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border"
                          width={100}
                          height={100}
                        />
                        <button
                          type="button"
                          onClick={() => removePhotoForm(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                              <Label htmlFor={`title-${index}`}>Title *</Label>
                            <Input
                              id={`title-${index}`}
                              value={photoForm.data.title}
                              onChange={(e) => updatePhotoForm(index, 'title', e.target.value)}
                                placeholder="Photo title"
                              required
                            />
                          </div>
                          <div>
                            <LocationDropdown
                              value={photoForm.data.location || ''}
                              onChange={(value) => updatePhotoForm(index, 'location', value)}
                                placeholder="Where was it taken?"

                            />
                          </div>
                        </div>

                        <div>
                            <Label htmlFor={`description-${index}`}>Description</Label>
                          <textarea
                            id={`description-${index}`}
                            value={photoForm.data.description || ''}
                            onChange={(e) => updatePhotoForm(index, 'description', e.target.value)}
                              placeholder="Tell the story behind this photo..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <DatePicker
                              value={photoForm.data.date_taken || ''}
                              onChange={(value) => updatePhotoForm(index, 'date_taken', value)}
                                label="Date *"
                                placeholder="Select date"
                            />
                          </div>
                          <div>
                            <Label>Tag</Label>
                            <div className="space-y-2">
                              {/* Available tags */}
                              <div className="flex flex-wrap gap-1">
                                {localTags.slice(0, 8).map(tag => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => addTagToPhoto(index, tag.name)}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200"
                                  >
                                    {tag.name}
                                  </button>
                                ))}
                              </div>
                              
                              {/* Add new tag for this photo */}
                              <div className="flex gap-2">
                                <Input
                                    placeholder="New tag for this photo"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        addTagToPhoto(index, input.value.trim());
                                        input.value = '';
                                      }
                                    }
                                  }}
                                  className="text-xs"
                                />
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      addTagToPhoto(index, input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                >
                                  +
                                </Button>
                              </div>

                              {/* Selected Tags */}
                              {photoForm.data.tags && photoForm.data.tags.length > 0 && (
                                <div>
                                    <Label className="text-xs text-gray-600 dark:text-gray-300">Selected tags</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {photoForm.data.tags.map(tag => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs flex items-center gap-1"
                                      >
                                        {tag}
                                        <button
                                          type="button"
                                          onClick={() => removeTagFromPhoto(index, tag)}
                                          className="hover:text-red-600"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Error Message */}
                        {photoForm.error && (
                          <p className="text-sm text-red-500">{photoForm.error}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              ))}
            </div>

            {/* Upload All Button at the bottom */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleUploadAll}
                disabled={
                  isUploadingAll || 
                  photoForms.some(f => f.error) || 
                  photoForms.length === 0 ||
                  photoForms.some(f => !f.data.title.trim() || !f.data.date_taken?.trim())
                }
                size="lg"
                className="flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                {isUploadingAll ? 'Uploading...' : `Upload All ${photoForms.length} Photos`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
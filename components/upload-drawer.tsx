import { Button } from '@/components/ui/button';
import { UploadPhotoForm } from '@/components/upload-photo-form';
import { Tag } from '@/lib/types';
import { Plus } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface UploadDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUploaded: () => void;
  availableTags: Tag[];
  onTagsUpdated?: () => void;
}

export function UploadDrawer({ 
  isOpen, 
  onOpenChange, 
  onPhotoUploaded, 
  availableTags,
  onTagsUpdated
}: UploadDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Photos
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <DrawerHeader>
          <DrawerTitle>Upload new photos</DrawerTitle>
          <DrawerDescription>
            Add your travel photos with details and tags
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          <UploadPhotoForm
            onPhotoUploaded={onPhotoUploaded}
            availableTags={availableTags}
            onTagsUpdated={onTagsUpdated}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
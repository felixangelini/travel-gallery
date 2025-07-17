import { UploadPhotoForm } from '@/components/upload-photo-form';
import { Tag, TravelPhoto } from '@/lib/types';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface EditDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUpdated: () => void;
  availableTags: Tag[];
  onTagsUpdated?: () => void;
  photoToEdit: TravelPhoto | null;
}

export function EditDrawer({ 
  isOpen, 
  onOpenChange, 
  onPhotoUpdated, 
  availableTags,
  onTagsUpdated,
  photoToEdit
}: EditDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full">
        <DrawerHeader>
          <DrawerTitle>Edit photo</DrawerTitle>
          <DrawerDescription>
            Update photo details, tags, and location
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          {photoToEdit && (
            <UploadPhotoForm
              mode="edit"
              photoToEdit={photoToEdit}
              onPhotoUpdated={onPhotoUpdated}
              availableTags={availableTags}
              onTagsUpdated={onTagsUpdated}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
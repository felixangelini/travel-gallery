'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useApi } from '@/lib/hooks';
import { Location } from '@/lib/types';



interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  withLabel?: boolean;
  onLocationCreated?: () => void;
}

export function LocationDropdown({ value, onChange, placeholder = "Select location", withLabel = true, onLocationCreated }: LocationDropdownProps) {
  const { fetchData, postData } = useApi();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getLocations = async () => {
    try {
      const data = await fetchData<Location[]>('/api/locations');
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Error loading locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocations();
  }, []);

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;

    setIsAdding(true);
    try {
      const data = await postData<Location>('/api/locations', { name: newLocation.trim() });

      // Reload locations to get the updated list
      await getLocations();
      onChange(data.name);
      setNewLocation('');
      setOpen(false);
      toast.success(`Location "${newLocation.trim()}" added successfully`);

      // Notify parent component that a location was created
      if (onLocationCreated) {
        onLocationCreated();
      }
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Error adding location');
    } finally {
      setIsAdding(false);
    }
  };

  const selectedLocation = locations.find(loc => loc.name === value);

  return (
    <div className="flex flex-col gap-2">
      {withLabel && (
        <Label className="px-1 text-sm font-medium">
          Location
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
          >
            <span className={selectedLocation ? '' : 'text-muted-foreground dark:text-white'}>
              {selectedLocation ? selectedLocation.name : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          {/* Add new location */}
          <div className="p-3 border-b">
            <div className="flex gap-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add new location"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                className="text-sm"
              />
              <Button
                onClick={handleAddLocation}
                disabled={isAdding || !newLocation.trim()}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Location list */}
          <div className="max-h-[200px] overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading locations...</div>
            ) : locations.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No locations available</div>
            ) : (
              locations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent text-sm"
                  onClick={() => {
                    onChange(location.name);
                    setOpen(false);
                  }}
                >
                  {location.name}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
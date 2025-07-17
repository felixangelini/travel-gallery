'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import { Tag } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LocationDropdown } from '@/components/location-dropdown';

interface FiltersProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export function Filters({
  tags,
  selectedTag,
  onTagChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedLocation,
  onLocationChange
}: FiltersProps) {
  return (
    <div className="mb-6">
      <Accordion type="single" collapsible className="w-full transition-all duration-500 ease-in-out">
        <AccordionItem value="filters" className="bg-gray-100 rounded-lg px-4">
          <AccordionTrigger className="text-lg dark:text-gray-900 font-semibold">
            Filters
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6 pt-2">
              {/* Tag and Location Filters */}
              <div className="w-full">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Tag Filter */}
                  {tags.length > 0 && (
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">Tag</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedTag === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => onTagChange(null)}
                        >
                          All
                        </Button>
                        {tags.map(tag => (
                          <Button
                            key={tag.id}
                            variant={selectedTag === tag.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => onTagChange(tag.name)}
                          >
                            {tag.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Filter */}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Location</h4>
                    <LocationDropdown
                      value={selectedLocation}
                      onChange={onLocationChange}
                      placeholder="Select location"
                      withLabel={false}

                    />
                  </div>
                </div>
              </div>

              {/* Date Filter */}
              <div className="w-full">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Period</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <DatePicker
                      value={dateFrom}
                      onChange={onDateFromChange}
                      label="Date from"
                      placeholder="Select start date"
                    />
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      value={dateTo}
                      onChange={onDateToChange}
                      label="Date to"
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => {
                    onTagChange(null);
                    onLocationChange('');
                    onDateFromChange('');
                    onDateToChange('');
                  }}
                  disabled={!selectedTag && !selectedLocation && !dateFrom && !dateTo}
                  size="sm"
                >
                  Clear all
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

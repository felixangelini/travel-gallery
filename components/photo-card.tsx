import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TravelPhoto } from '@/lib/types';
import { MapPin, Calendar, Trash2, Edit, X } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface PhotoCardProps {
  photo: TravelPhoto;
  onDelete?: (photo: TravelPhoto) => void;
  onEdit?: (photo: TravelPhoto) => void;
  deleting?: boolean;
}

export function PhotoCard({ photo, onDelete, onEdit, deleting }: PhotoCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close overlay on outside click
  useEffect(() => {
    if (!showOverlay) return;
    const handleClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOverlay]);

  // Handle click/tap
  const handleCardClick = () => {
    if (isMobile) {
      setShowOverlay((prev) => !prev);
    } else {
      setShowFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: it });
    } catch {
      // Fallback if date is not valid
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      <Card
        ref={cardRef}
        className="relative group overflow-hidden h-64 cursor-pointer"
        onMouseEnter={() => !isMobile && setShowOverlay(true)}
        onMouseLeave={() => !isMobile && setShowOverlay(false)}
        onClick={handleCardClick}
      >
      <Image
        src={photo.image_url}
        alt={photo.title}
        fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        style={{ zIndex: 0 }}
      />
        {/* Title always visible at bottom, with gradient background */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent px-4 py-3 z-10">
        <span className="text-white text-lg font-semibold drop-shadow line-clamp-2">{photo.title}</span>
      </div>
        {/* Details overlay: visible on hover/click */}
      <div 
        className={`absolute inset-0 bg-black/80 flex flex-col justify-end p-4 z-20 transition-all duration-300 ease-out ${
          showOverlay 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="space-y-1 mb-2">
              {photo.location && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{photo.location}</span>
                </div>
              )}
              {photo.date_taken && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(photo.date_taken)}</span>
                </div>
              )}
            </div>
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {photo.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs opacity-80">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={(e) => { e.stopPropagation(); onEdit(photo); }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 ml-2 flex-shrink-0 self-end"
              onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>

      {/* Fullscreen modal */}
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        showFullscreen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={closeFullscreen}
    >
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          showFullscreen ? 'opacity-90' : 'opacity-0'
        }`}
      />
      <div 
        className={`relative max-w-4xl max-h-full w-full h-full flex flex-col transition-all duration-300 ease-out ${
          showFullscreen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header with title and close button */}
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-2xl font-bold">{photo.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeFullscreen}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Main image */}
          <div className="flex-1 relative min-h-0">
            <Image
              src={photo.image_url}
              alt={photo.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              className="object-contain"
            />
          </div>

          {/* Footer with details */}
          <div className="mt-4 text-white space-y-3">
            {photo.description && (
              <p className="text-lg leading-relaxed">{photo.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {photo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{photo.location}</span>
                </div>
              )}
              {photo.date_taken && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(photo.date_taken)}</span>
                </div>
              )}
            </div>

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onEdit(photo); }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
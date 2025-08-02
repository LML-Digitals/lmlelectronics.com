'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { Listing } from './types/types';

interface ListingsManagerProps {
  listings: Listing[];
  onListingsChange: (listings: Listing[]) => void;
  onIconUpload: (file: File) => Promise<string>;
}

export default function ListingsManager({
  listings,
  onListingsChange,
  onIconUpload,
}: ListingsManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleIconUpload = async (index: number, file: File) => {
    setIsUploading(true);
    try {
      const iconUrl = await onIconUpload(file);
      const newListings = [...listings];
      newListings[index] = { ...newListings[index], icon: iconUrl };
      onListingsChange(newListings);
    } catch (error) {
      console.error('Error uploading icon:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addListing = () => {
    onListingsChange([
      ...listings,
      { name: '', link: '', icon: '/logo.png' },
    ]);
  };

  const removeListing = (index: number) => {
    onListingsChange(listings.filter((_, i) => i !== index));
  };

  const updateListing = (
    index: number,
    field: keyof Listing,
    value: string
  ) => {
    const newListings = [...listings];
    newListings[index] = { ...newListings[index], [field]: value };
    onListingsChange(newListings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Listings</h3>
      <div className="space-y-4">
        {listings.map((listing, index) => (
          <div key={index} className="flex items-center gap-4 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.icon || '/logo.png'}
                  alt={listing.name}
                  className="w-full h-full object-cover"
                />
                <Label
                  htmlFor={`listing-icon-${index}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Upload className="w-4 h-4 text-white" />
                  )}
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  id={`listing-icon-${index}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleIconUpload(index, file);
                  }}
                  disabled={isUploading}
                />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input
                value={listing.name}
                onChange={(e) => updateListing(index, 'name', e.target.value)}
                placeholder="Name (e.g., Menu, Order Online)"
              />
              <Input
                value={listing.link}
                onChange={(e) => updateListing(index, 'link', e.target.value)}
                placeholder="Link (e.g., https://menu.com/...)"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeListing(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addListing}
        >
          Add Quick Link
        </Button>
      </div>
    </div>
  );
}

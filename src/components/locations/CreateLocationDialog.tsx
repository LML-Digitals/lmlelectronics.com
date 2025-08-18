'use client';

import React, { useState, useEffect } from 'react';
import { StoreLocation } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Trash,
  Upload,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LocationMap from './LocationMap';
import ListingsManager from './ListingsManager';
import SocialMediaManager from './SocialMediaManager';
import {
  DayHours,
  WeeklyHours,
  SocialMediaLink,
  ImageUpload,
  Listing,
} from './types/types';
import { createStoreLocation } from './services/storeLocationCrud';

interface CreateLocationDialogProps {
  onSuccess?: () => void;
}

export function CreateLocationDialog ({ onSuccess }: CreateLocationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { toast } = useToast();
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize weekly hours
  const defaultHours: WeeklyHours = {
    monday: { open: '09:00', close: '17:00', isClosed: false },
    tuesday: { open: '09:00', close: '17:00', isClosed: false },
    wednesday: { open: '09:00', close: '17:00', isClosed: false },
    thursday: { open: '09:00', close: '17:00', isClosed: false },
    friday: { open: '09:00', close: '17:00', isClosed: false },
    saturday: { open: '10:00', close: '15:00', isClosed: false },
    sunday: { open: '10:00', close: '15:00', isClosed: true },
  };

  const [formData, setFormData] = useState<Partial<StoreLocation>>({
    name: '',
    address: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    countryCode: 'US',
    phone: '',
    email: '',
    squareLocationEnvKey: '',
    hours: defaultHours,
    images: [],
    listings: [],
    socialMedia: {},
    isActive: true,
  });

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(defaultHours);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [entranceSteps, setEntranceSteps] = useState('');

  // Square location environment key options
  const squareLocationOptions = [
    { value: 'none', label: 'Not configured' },
    { value: 'SQUARE_LOCATION_ID', label: 'Default Location' },
    {
      value: 'SQUARE_WEST_SEATTLE_LOCATION_ID',
      label: 'West Seattle',
    },
    { value: 'SQUARE_SEATTLE_LOCATION_ID', label: 'Seattle' },
    {
      value: 'SQUARE_NORTH_SEATTLE_LOCATION_ID',
      label: 'North Seattle',
    },
  ];

  // Update address whenever address components change
  useEffect(() => {
    const generateFullAddress = () => {
      const { streetAddress, city, state, zip, countryCode } = formData;
      let fullAddress = '';

      if (streetAddress) { fullAddress += streetAddress; }
      if (city) { fullAddress += fullAddress ? `, ${city}` : city; }
      if (state) { fullAddress += fullAddress ? `, ${state}` : state; }
      if (zip) { fullAddress += fullAddress ? ` ${zip}` : zip; }
      if (countryCode) { fullAddress += fullAddress ? `, ${countryCode}` : countryCode; }

      return fullAddress;
    };

    setFormData((prev) => ({
      ...prev,
      address: generateFullAddress(),
    }));
  }, [
    formData.streetAddress,
    formData.city,
    formData.state,
    formData.zip,
    formData.countryCode,
    formData,
  ]);

  const handleHoursChange = (
    day: string,
    field: keyof DayHours,
    value: string | boolean,
  ) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }

      const newBlob = await response.json();

      return newBlob.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImageUploading(true);
    try {
      const files = Array.from(e.target.files ?? []);
      const newImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));

      setImages([...images, ...newImages]);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to process images',
        variant: 'destructive',
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsImageUploading(true);

    try {
      const files = Array.from(e.dataTransfer.files);
      const newImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));

      setImages([...images, ...newImages]);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to process dropped images',
        variant: 'destructive',
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleIconUpload = async (file: File): Promise<string> => {
    try {
      // const formData = new FormData();
      // formData.append('file', file);

      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) throw new Error('Failed to upload icon');

      // const data = await response.json();
      const url = await uploadImage(file);

      // console.log("url", url);
      return url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload icon',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload new images first
      const uploadedImages = await Promise.all(images
        .filter((img) => img.isNew && img.file)
        .map(async (img) => {
          const url = await uploadImage(img.file!);

          return url;
        }));

      // Serialize JSON fields
      const serializedData = {
        ...formData,
        hours: JSON.stringify(weeklyHours),
        images: JSON.stringify(uploadedImages),
        socialMedia: JSON.stringify(socialLinks),
        listings: JSON.stringify(listings),
        entranceSteps: entranceSteps.trim() ?? null,
      };

      // Call the server action
      const result = await createStoreLocation(serializedData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        description: 'Location created successfully',
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (_error) {
      toast({
        description: 'Failed to create location',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="min-h-[44px]">
        <Plus className="mr-2 h-4 w-4" />
        Add Location
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] h-[90vh] sm:h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Location</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Fill in the location details. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full pr-4">
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 sm:space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                  <TabsTrigger value="hours" className="text-xs sm:text-sm">Hours</TabsTrigger>
                  <TabsTrigger value="images" className="text-xs sm:text-sm">Images</TabsTrigger>
                  <TabsTrigger value="more" className="text-xs sm:text-sm">More Info</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">Location Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Downtown Store"
                      value={formData.name ?? ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="text-sm sm:text-base min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress" className="text-sm sm:text-base">Street Address *</Label>
                      <Input
                        id="streetAddress"
                        placeholder="123 Main St"
                        value={formData.streetAddress ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          streetAddress: e.target.value,
                        })
                        }
                        required
                        className="text-sm sm:text-base min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm sm:text-base">City *</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={formData.city ?? ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })
                          }
                          required
                          className="text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm sm:text-base">State/Province *</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={formData.state ?? ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })
                          }
                          required
                          className="text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-sm sm:text-base">ZIP/Postal Code *</Label>
                        <Input
                          id="zip"
                          placeholder="10001"
                          value={formData.zip ?? ''}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })
                          }
                          required
                          className="text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="countryCode" className="text-sm sm:text-base">Country Code *</Label>
                        <Input
                          id="countryCode"
                          placeholder="US"
                          value={formData.countryCode ?? ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            countryCode: e.target.value,
                          })
                          }
                          required
                          className="text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm sm:text-base">Full Address</Label>
                      <Input
                        id="address"
                        value={formData.address ?? ''}
                        disabled
                        className="text-sm sm:text-base min-h-[44px]"
                      />
                    </div>

                    {formData.address && (
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Map Preview</Label>
                        <LocationMap
                          address={formData.address}
                          className="h-[200px] sm:h-[300px]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={formData.phone ?? ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="text-sm sm:text-base min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="store@example.com"
                      value={formData.email ?? ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="text-sm sm:text-base min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="squareLocationEnvKey" className="text-sm sm:text-base">
                      Square Location Environment Key
                    </Label>
                    <Select
                      value={formData.squareLocationEnvKey ?? ''}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        squareLocationEnvKey: value,
                      })
                      }
                    >
                      <SelectTrigger className="text-sm sm:text-base min-h-[44px]">
                        <SelectValue placeholder="Select a location environment key" />
                      </SelectTrigger>
                      <SelectContent>
                        {squareLocationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive" className="text-sm sm:text-base">Active Location</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Toggle whether this location is currently active and
                            visible to customers
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TabsContent>

                <TabsContent value="hours" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {Object.entries(weeklyHours).map(([day, hours]) => (
                          <div key={day} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="capitalize text-sm sm:text-base">{day}</Label>
                              <Switch
                                checked={!hours.isClosed}
                                onCheckedChange={(checked) => handleHoursChange(day, 'isClosed', !checked)
                                }
                              />
                            </div>
                            {!hours.isClosed && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`${day}-open`} className="text-sm sm:text-base">Opens</Label>
                                  <Input
                                    id={`${day}-open`}
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => handleHoursChange(
                                      day,
                                      'open',
                                      e.target.value,
                                    )
                                    }
                                    className="text-sm sm:text-base min-h-[44px]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${day}-close`} className="text-sm sm:text-base">Closes</Label>
                                  <Input
                                    id={`${day}-close`}
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => handleHoursChange(
                                      day,
                                      'close',
                                      e.target.value,
                                    )
                                    }
                                    className="text-sm sm:text-base min-h-[44px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="images" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <Label
                            htmlFor="images"
                            className={cn(
                              'relative flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200',
                              isDragging
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted border-muted-foreground/25',
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            {isImageUploading && (
                              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                              </div>
                            )}
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload
                                className={cn(
                                  'h-6 w-6 sm:h-8 sm:w-8 mb-2 transition-colors duration-200',
                                  isDragging
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              />
                              <p
                                className={cn(
                                  'text-xs sm:text-sm transition-colors duration-200',
                                  isDragging
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              >
                                Drag & drop images here, or click to select
                              </p>
                            </div>
                            <Input
                              id="images"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              disabled={isImageUploading}
                            />
                          </Label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {images.map((image, index) => (
                            <div
                              key={`image-${image.url}-${index}`}
                              className="relative aspect-video rounded-lg overflow-hidden"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image.url}
                                alt={`Location image ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 min-h-[44px] min-w-[44px]"
                                onClick={() => removeImage(index)}
                                disabled={isImageUploading}
                              >
                                <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="more" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <SocialMediaManager
                        links={socialLinks}
                        onLinksChange={setSocialLinks}
                        onIconUpload={async (file) => {
                          try {
                            return await handleIconUpload(file);
                          } catch (error) {
                            // Handle error silently or show toast
                            return '';
                          }
                        }}
                      />

                      <Separator />

                      <ListingsManager
                        listings={listings}
                        onListingsChange={setListings}
                        onIconUpload={async (file) => {
                          try {
                            return await handleIconUpload(file);
                          } catch (error) {
                            // Handle error silently or show toast
                            return '';
                          }
                        }}
                      />

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Entrance Instructions</Label>
                        <Textarea
                          value={entranceSteps}
                          onChange={(e) => setEntranceSteps(e.target.value)}
                          placeholder="Enter instructions for finding the entrance (optional)"
                          rows={3}
                          className="text-sm sm:text-base min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="min-h-[44px] w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Location'
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

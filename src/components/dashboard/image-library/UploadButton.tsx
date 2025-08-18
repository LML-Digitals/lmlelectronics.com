'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadImage } from './actions';

export default function UploadButton ({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) { return; }

    setIsUploading(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const formData = new FormData();

          formData.append('file', file);

          const result = await uploadImage(formData);

          if (result.error) {
            console.error(`Failed to upload ${file.name}:`, result.error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description:
            files.length > 1
              ? `${successCount} images uploaded successfully${
                errorCount > 0 ? `, ${errorCount} failed` : ''
              }`
              : 'Image uploaded successfully',
        });

        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete();
        }
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to upload images',
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload images',
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      <Button
        onClick={handleButtonClick}
        className="gap-2 min-h-[44px] text-xs sm:text-sm"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        Upload Image
      </Button>
    </>
  );
}

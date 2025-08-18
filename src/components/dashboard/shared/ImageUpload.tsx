'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import type { UploadResponse } from '@/lib/types/upload';

interface ImageUploadProps {
  value: string[];
  disabled?: boolean;
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload ({
  value,
  disabled,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image${
              response.statusText}`);
          }

          const result = (await response.json()) as UploadResponse;

          return result.url;
        });

        const urls = await Promise.all(uploadPromises);

        onChange(urls.filter((url): url is string => url !== null));
        console.log(
          'urls',
          urls.filter((url): url is string => url !== null),
        );
      } catch (error) {
        console.error('Error uploading images:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload images.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    disabled,
    maxFiles: 5,
  });

  return (
    <div className="">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 rounded-md cursor-pointer transition-colors text-center pb-2
          ${
    isDragActive
      ? 'border-primary bg-primary/5'
      : 'border-gray-300 hover:border-primary'
    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop images here, or click to select files'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              (Up to 5 files, max 5MB each)
            </p>
            <Button className="mt-4" variant="secondary" type="button">
              Select Files
            </Button>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1">
          {value.map((url) => (
            <div
              key={url}
              className="relative group aspect-square rounded-md overflow-hidden border"
            >
              <Image
                src={url}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <Button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                size="icon"
                variant="destructive"
                onClick={() => onRemove(url)}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

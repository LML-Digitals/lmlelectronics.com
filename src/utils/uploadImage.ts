'use server';

import type { UploadResponse } from '@/lib/types/upload';

export async function uploadImage (file: File): Promise<string> {
  const response = await fetch(`/api/upload?filename=${file.name}`, {
    method: 'POST',
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = (await response.json()) as UploadResponse;

  return data.url;
}

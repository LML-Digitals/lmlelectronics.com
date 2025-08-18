'use server';

import { getServerSession } from 'next-auth';
import supabase from '@/lib/supabase';
import { authOptions } from '@/lib/config/authOptions';
import { revalidatePath } from 'next/cache';

type SortOptions = {
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
};

type StorageFile = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
};

async function getAllFilesRecursively (
  path = '',
  allFiles: any[] = [],
): Promise<any[]> {
  const { data: files, error } = await supabase.storage
    .from('lml-repair')
    .list(path, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }, // Sort folders first for consistent ordering
    });

  if (error) { throw error; }
  if (!files) { return allFiles; }

  for (const file of files) {
    if (file.id === null) {
      // It's a folder, recurse into it
      const folderPath = path ? `${path}/${file.name}` : file.name;

      await getAllFilesRecursively(folderPath, allFiles);
    } else {
      // It's a file, add it to the list
      allFiles.push({
        ...file,
        fullPath: path ? `${path}/${file.name}` : file.name,
      });
    }
  }

  return allFiles;
}

export async function getImages (
  query = '',
  options: SortOptions = { sortBy: 'created_at', sortOrder: 'desc' },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Get all files from Supabase storage
    const files = await getAllFilesRecursively();

    // Filter files based on search query and convert to our format
    const filteredFiles = files
      .filter((file) => {
        if (!query) { return true; }

        return file.name.toLowerCase().includes(query.toLowerCase());
      })
      .filter((file) => {
        // Only include image files
        const imageExtensions = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.webp',
          '.svg',
        ];

        return imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      })
      .sort((a, b) => {
        // Apply sorting based on options
        let aValue, bValue;

        switch (options.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || 0).getTime();
          bValue = new Date(b.updated_at || 0).getTime();
          break;
        default:
          return 0;
        }

        if (options.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

    // Convert to our ImageItem format
    const images: StorageFile[] = filteredFiles.map((file) => {
      const { data } = supabase.storage
        .from('lml-repair')
        .getPublicUrl(file.fullPath || file.name);

      return {
        id: file.id || file.fullPath || file.name, // Use fullPath as fallback ID
        name: file.name,
        url: data.publicUrl,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        last_accessed_at: file.last_accessed_at || new Date().toISOString(),
        metadata: file.metadata || {
          eTag: '',
          size: 0,
          mimetype: 'image/*',
          cacheControl: 'max-age=3600',
          lastModified: new Date().toISOString(),
          contentLength: 0,
          httpStatusCode: 200,
        },
      };
    });

    return { images };
  } catch (error) {
    console.error('Error fetching images:', error);

    return { error: 'Failed to fetch images' };
  }
}

export async function deleteImage (filename: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    if (!filename) {
      throw new Error('Filename is required');
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('lml-repair')
      .remove([filename]);

    if (error) {
      throw new Error(`Failed to delete from storage: ${error.message}`);
    }

    // Revalidate the path to update UI
    revalidatePath('/dashboard/image-library');

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);

    return { error: 'Failed to delete image' };
  }
}

export async function uploadImage (formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const filename = `${timestamp}-${originalName}`;

    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from('lml-repair')
      .list('', { search: originalName });

    if (existingFiles && existingFiles.length > 0) {
      const exactMatch = existingFiles.find((f) => f.name === originalName);

      if (exactMatch) {
        throw new Error('A file with this name already exists');
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('lml-repair')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lml-repair')
      .getPublicUrl(filename);

    revalidatePath('/dashboard/image-library');

    return {
      success: true,
      url: urlData.publicUrl,
      filename: filename,
    };
  } catch (error) {
    console.error('Error uploading image:', error);

    return {
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

export async function getStorageStats () {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const { data: files, error } = await supabase.storage
      .from('lml-repair')
      .list('', { limit: 1000 });

    if (error) {
      throw new Error(`Failed to fetch storage stats: ${error.message}`);
    }

    const totalFiles = files?.length || 0;
    const totalSize
      = files?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0;

    return {
      totalFiles,
      totalSize,
      formattedSize: formatFileSize(totalSize),
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);

    return { error: 'Failed to get storage stats' };
  }
}

export async function renameImage (oldFilename: string, newFilename: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    if (!oldFilename || !newFilename) {
      throw new Error('Both old and new filenames are required');
    }

    // Validate new filename
    if (newFilename.trim() === '') {
      throw new Error('New filename cannot be empty');
    }

    // Check if new filename already exists
    const { data: existingFiles } = await supabase.storage
      .from('lml-repair')
      .list('', { search: newFilename });

    if (existingFiles && existingFiles.length > 0) {
      const exactMatch = existingFiles.find((f) => f.name === newFilename);

      if (exactMatch) {
        throw new Error('A file with this name already exists');
      }
    }

    // Download the original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('lml-repair')
      .download(oldFilename);

    if (downloadError) {
      throw new Error(`Failed to download original file: ${downloadError.message}`);
    }

    // Upload the file with the new name
    const { error: uploadError } = await supabase.storage
      .from('lml-repair')
      .upload(newFilename, fileData, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload renamed file: ${uploadError.message}`);
    }

    // Delete the original file
    const { error: deleteError } = await supabase.storage
      .from('lml-repair')
      .remove([oldFilename]);

    if (deleteError) {
      // If deletion fails, try to clean up the new file
      await supabase.storage.from('lml-repair').remove([newFilename]);
      throw new Error(`Failed to delete original file: ${deleteError.message}`);
    }

    // Revalidate the path to update UI
    revalidatePath('/dashboard/image-library');

    return { success: true };
  } catch (error) {
    console.error('Error renaming image:', error);

    return {
      error: error instanceof Error ? error.message : 'Failed to rename image',
    };
  }
}

function formatFileSize (bytes: number): string {
  if (bytes === 0) { return '0 Bytes'; }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

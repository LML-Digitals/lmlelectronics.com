import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/config/authOptions';
import { revalidatePath } from 'next/cache';
import supabase from '@/lib/supabase';

export async function POST (request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const size = searchParams.get('size')
      ? parseInt(searchParams.get('size') as string, 10)
      : null;
    const mimeType = searchParams.get('mimeType') || '';

    if (!filename || !request.body) {
      return NextResponse.json(
        { message: 'Filename or request body is missing' },
        { status: 400 },
      );
    }

    // Check if an image with the same filename already exists in storage
    const { data: existingFiles } = await supabase.storage
      .from('lml-repair')
      .list('', { search: filename });

    if (existingFiles && existingFiles.some((file) => file.name === filename)) {
      // If image exists, return its public URL without uploading again
      const { data: publicUrlData } = await supabase.storage
        .from('lml-repair')
        .getPublicUrl(filename);

      return NextResponse.json({
        url: publicUrlData.publicUrl,
        pathname: filename,
        contentType: mimeType,
        contentDisposition: `attachment; filename="${filename}"`,
        id: filename, // Use filename as ID since we're not using database
      });
    }

    // If image doesn't exist, proceed with upload
    // Clone the request to get the file data as a buffer
    const fileData = await request.arrayBuffer();

    // Upload to Supabase Storage
    const bucketName = 'lml-repair';
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, fileData, {
        contentType: mimeType,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json(
        { message: 'Failed to upload image to storage' },
        { status: 500 },
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    if (!publicUrlData) {
      console.error('Failed to generate public URL');
      return NextResponse.json(
        { message: 'Failed to generate public URL' },
        { status: 500 },
      );
    }

    const fileUrl = publicUrlData.publicUrl;

    // Revalidate the image library page
    revalidatePath('/dashboard/image-library');

    // Create response with CORS headers
    const response = NextResponse.json({
      url: fileUrl,
      pathname: filename,
      contentType: mimeType,
      contentDisposition: `attachment; filename="${filename}"`,
      id: filename, // Use filename as ID since we're not using database
    });

    // Add CORS headers to the response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    return response;
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

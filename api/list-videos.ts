import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // List all videos from the blob storage
    const { blobs } = await list({
      prefix: 'videos/',
    });

    // Filter for video files and format response
    const videos = blobs
      .filter(blob => blob.pathname.startsWith('videos/'))
      .map(blob => ({
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        filename: blob.pathname.replace('videos/', '')
      }));

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('List videos error:', error);
    return NextResponse.json(
      { error: 'Failed to list videos' }, 
      { status: 500 }
    );
  }
}
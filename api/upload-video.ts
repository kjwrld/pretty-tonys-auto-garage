import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    if (!req.body) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`videos/${filename}`, req.body, {
      access: 'public',
      contentType: 'video/mp4',
    });

    return NextResponse.json({ 
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: blob.size 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' }, 
      { status: 500 }
    );
  }
}
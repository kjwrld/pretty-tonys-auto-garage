import { useState, useEffect } from 'react';

interface Video {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  filename: string;
}

interface UseVideoReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
  uploadVideo: (file: File) => Promise<Video | null>;
  refreshVideos: () => Promise<void>;
}

export function useVideo(): UseVideoReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/list-videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File): Promise<Video | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload-video?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadedVideo = await response.json();
      
      // Refresh the videos list
      await fetchVideos();
      
      return uploadedVideo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshVideos = async () => {
    await fetchVideos();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    uploadVideo,
    refreshVideos,
  };
}
import React, { useState, useEffect } from 'react'
import { imagePreloader } from '../../services/imagePreloader'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState(props.src)

  const { src, alt, style, className, preload = true, priority = 'medium', ...rest } = props

  // Check if image is already cached to determine initial loading state
  const isCached = preload && src && !src.endsWith('.mp4') ? !!imagePreloader.getCachedUrl(src) : true
  const [isLoading, setIsLoading] = useState(!isCached)

  useEffect(() => {
    if (!src || src.endsWith('.mp4')) {
      setOptimizedSrc(src)
      setIsLoading(false)
      return
    }

    if (preload) {
      // Check if we already have this image cached
      const cached = imagePreloader.getCachedUrl(src)
      if (cached) {
        setOptimizedSrc(cached)
        setIsLoading(false)
        return
      }

      // Only show loading if not cached
      setIsLoading(true)

      // Preload the image
      imagePreloader.preloadImage(src, { priority })
        .then((preloadedUrl) => {
          setOptimizedSrc(preloadedUrl)
          setIsLoading(false)
        })
        .catch(() => {
          // Fallback to original URL if preloading fails
          setOptimizedSrc(src)
          setIsLoading(false)
        })
    } else {
      setOptimizedSrc(src)
      setIsLoading(false)
    }
  }, [src, preload, priority])

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className ?? ''}`}
          style={style}
        />
      )}
      <img 
        src={optimizedSrc} 
        alt={alt} 
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
        style={style} 
        {...rest} 
        onError={handleError}
        onLoad={handleLoad}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}

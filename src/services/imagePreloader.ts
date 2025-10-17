interface PreloadedImage {
    url: string;
    blob: Blob;
    objectUrl: string;
    timestamp: number;
}

interface PreloadOptions {
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
}

class ImagePreloadService {
    private cache = new Map<string, PreloadedImage>();
    private loadingPromises = new Map<string, Promise<string>>();
    private maxCacheSize = 50;
    private maxCacheAge = 30 * 60 * 1000; // 30 minutes

    async preloadImage(url: string, options: PreloadOptions = {}): Promise<string> {
        // Return cached version if available and not expired
        const cached = this.cache.get(url);
        if (cached && this.isValidCache(cached)) {
            return cached.objectUrl;
        }

        // Return existing loading promise if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url)!;
        }

        // Create new loading promise
        const loadingPromise = this.loadImageWithCache(url, options);
        this.loadingPromises.set(url, loadingPromise);

        try {
            const result = await loadingPromise;
            this.loadingPromises.delete(url);
            return result;
        } catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }

    private async loadImageWithCache(url: string, options: PreloadOptions): Promise<string> {
        const { timeout = 10000 } = options;

        try {
            // For video files, return the URL directly without caching blob
            if (url.endsWith('.mp4') || url.includes('video')) {
                return url;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Cache-Control': 'public, max-age=31536000', // 1 year
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Failed to load image: ${response.status}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const preloadedImage: PreloadedImage = {
                url,
                blob,
                objectUrl,
                timestamp: Date.now()
            };

            this.addToCache(url, preloadedImage);
            return objectUrl;

        } catch (error) {
            console.warn(`Failed to preload image: ${url}`, error);
            // Return original URL as fallback
            return url;
        }
    }

    private addToCache(url: string, image: PreloadedImage): void {
        // Clean expired cache entries
        this.cleanExpiredCache();

        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            const oldestEntry = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
            
            if (oldestEntry) {
                URL.revokeObjectURL(oldestEntry[1].objectUrl);
                this.cache.delete(oldestEntry[0]);
            }
        }

        this.cache.set(url, image);
    }

    private isValidCache(cached: PreloadedImage): boolean {
        return Date.now() - cached.timestamp < this.maxCacheAge;
    }

    private cleanExpiredCache(): void {
        const now = Date.now();
        for (const [url, image] of this.cache.entries()) {
            if (now - image.timestamp > this.maxCacheAge) {
                URL.revokeObjectURL(image.objectUrl);
                this.cache.delete(url);
            }
        }
    }

    async preloadImages(urls: string[], options: PreloadOptions = {}): Promise<string[]> {
        const promises = urls.map(url => this.preloadImage(url, options));
        return Promise.allSettled(promises).then(results =>
            results.map((result, index) =>
                result.status === 'fulfilled' ? result.value : urls[index]
            )
        );
    }

    getCachedUrl(url: string): string | null {
        const cached = this.cache.get(url);
        if (cached && this.isValidCache(cached)) {
            return cached.objectUrl;
        }
        return null;
    }

    clearCache(): void {
        for (const image of this.cache.values()) {
            URL.revokeObjectURL(image.objectUrl);
        }
        this.cache.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            urls: Array.from(this.cache.keys())
        };
    }
}

export const imagePreloader = new ImagePreloadService();

// Helper function to extract all image URLs from products
export function extractAllImageUrls(products: any[]): string[] {
    const urls: string[] = [];
    
    for (const product of products) {
        if (product.image) {
            urls.push(product.image);
        }
        if (product.additionalImages && Array.isArray(product.additionalImages)) {
            urls.push(...product.additionalImages);
        }
    }
    
    return [...new Set(urls)]; // Remove duplicates
}
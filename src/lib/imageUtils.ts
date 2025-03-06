/**
 * Converts a Supabase storage URL to a proxied URL through our Next.js API
 * This helps avoid CORS and permission issues with Supabase storage
 * 
 * @param url The original Supabase storage URL
 * @returns The proxied URL
 */
export function getProxiedImageUrl(url: string | null): string {
    if (!url) return '';

    try {
        // Check if it's a Supabase storage URL
        if (url.includes('supabase.co/storage/v1/object/public/menu-images/')) {
            // Extract the path after the bucket name
            const pathMatch = url.match(/\/menu-images\/(.+)/);
            if (pathMatch && pathMatch[1]) {
                const path = pathMatch[1];
                return `/api/image-proxy?path=${encodeURIComponent(path)}`;
            }

            // If we couldn't extract the path using regex, try a different approach
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/menu-images/');
            if (pathParts.length > 1) {
                const path = pathParts[1];
                return `/api/image-proxy?path=${encodeURIComponent(path)}`;
            }

            console.warn(`Could not extract path from URL: ${url}`);
        }

        // Return the original URL if it's not a Supabase storage URL or we couldn't extract the path
        return url;
    } catch (error) {
        console.error('Error converting image URL:', error);
        return url;
    }
} 
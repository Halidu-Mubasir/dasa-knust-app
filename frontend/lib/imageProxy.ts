/**
 * Converts a backend media URL to use the Next.js image proxy.
 * This is necessary when the backend is behind ngrok which shows a browser warning
 * for direct image requests.
 *
 * @param url - The original media URL from the backend
 * @returns Proxied URL or null if input is invalid
 */
export function getProxiedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If it's already a data URL or relative path, return as is
  if (url.startsWith('data:') || url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  // If it's a full URL (http:// or https://), proxy it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // If it's a protocol-relative URL (//), proxy it
  if (url.startsWith('//')) {
    return `/api/proxy-image?url=${encodeURIComponent('https:' + url)}`;
  }

  return url;
}

/**
 * Use this for video URLs as well since they have the same ngrok issue
 */
export const getProxiedVideoUrl = getProxiedImageUrl;

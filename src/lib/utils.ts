export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Mengubah URL thumbnail resolusi rendah menjadi resolusi HD tajam (800x800 / HQ).
 * Menghilangkan gambar burik/pecah di seluruh aplikasi.
 */
export function getHdThumbnail(url?: string, videoId?: string): string {
  if (!url || typeof url !== 'string') {
    if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop';
  }

  // 1. Google / YouTube Music CDN (lh3.googleusercontent.com, yt3.ggpht.com)
  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    let hd = url;
    if (/=w\d+-h\d+/.test(hd)) {
      hd = hd.replace(/=w\d+-h\d+[^?]*/, '=w800-h800-l90-rj');
    } else if (/=s\d+/.test(hd)) {
      hd = hd.replace(/=s\d+[^?]*/, '=s800-c-k-c0x00ffffff-no-rj');
    } else if (!hd.includes('=w') && !hd.includes('=s')) {
      hd += '=w800-h800-l90-rj';
    }
    return hd;
  }

  // 2. YouTube Standard Video CDN (i.ytimg.com, img.youtube.com)
  if (url.includes('i.ytimg.com') || url.includes('img.youtube.com')) {
    const match = url.match(/\/vi\/([^\/]+)\//);
    const vid = match ? match[1] : videoId;
    if (vid) {
      return `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
    }
    return url.replace(/\/(default|mqdefault)\.jpg/, '/hqdefault.jpg');
  }

  // 3. Unsplash fallback images
  if (url.includes('unsplash.com')) {
    return url.replace(/w=\d+/, 'w=800').replace(/h=\d+/, 'h=800');
  }

  return url;
}

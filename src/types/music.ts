export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  durationFormatted?: string;
  thumbnail: string;
  canvasUrl?: string; // Spotify / YouTube looping canvas video or animation
}

export interface LyricLine {
  time: number; // timestamp in seconds
  text: string;
}

export interface LyricsData {
  synced: boolean;
  lines: LyricLine[];
  plain?: string;
}

export interface Album {
  id: string;
  title: string;
  year?: string;
  type?: string;
  thumbnail: string;
  trackCount?: number;
}

export interface PlaylistCard {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  songCount?: number;
  author?: string;
  isCommunity?: boolean;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  podcastTitle: string;
  author: string;
  description: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  publishedAt?: string;
  playbackProgress?: number; // resume timestamp
}

export interface PodcastShow {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  episodeCount?: number;
}

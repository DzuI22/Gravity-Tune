export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  durationFormatted?: string;
  thumbnail: string;
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

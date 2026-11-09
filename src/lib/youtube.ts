import { Innertube, UniversalCache } from 'youtubei.js';

let ytClient: Innertube | null = null;

export async function getYtClient(): Promise<Innertube> {
  if (ytClient) {
    return ytClient;
  }

  try {
    ytClient = await Innertube.create({
      cache: new UniversalCache(true),
      generate_session_locally: true,
    });
    return ytClient;
  } catch (err) {
    console.error('Failed to create Innertube client with cache, trying without cache:', err);
    ytClient = await Innertube.create({
      generate_session_locally: true,
    });
    return ytClient;
  }
}

export { formatDuration } from './utils';

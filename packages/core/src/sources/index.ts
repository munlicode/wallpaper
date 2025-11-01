import { FetchQuery, ISource, Wallpaper } from '../types.js';
import { LocalSource } from './local.js';
import { UnsplashSource } from './unsplash.js';
import { NekosSource } from './nekos.js';

// 1. Create a "registry" to hold all our available sources
export const sourceRegistry = new Map<string, ISource>();
/**
 * Call this function to register a new source.
 */
function registerSource(source: ISource) {
  sourceRegistry.set(source.name, source);
}

// 2. Register your initial sources
registerSource(new UnsplashSource());
registerSource(new LocalSource());
registerSource(new NekosSource());
// registerSource(new PexelsSource()); // TODO: Build & Add it


/**
 * This REPLACES your old function. It's much cleaner.
 * It takes a FetchQuery and finds the right source to handle it.
 */
export async function resolveWallpaper(query: string | FetchQuery): Promise<Wallpaper> {
  if (typeof query === "string") {
    try {
      query = JSON.parse(query) as FetchQuery;
    } catch (err) {
      throw new Error(`Failed to parse query JSON: ${err}`);
    }
  }

  const sourceName = query.source;
  const source = sourceRegistry.get(sourceName);

  if (!source) {
    throw new Error(`Wallpaper source "${sourceName}" is not registered.`);
  }

  return source.getWallpaper(query.query);
}
import { RandomOptions } from "../main/handlers/random.handlers";

export interface BookmarksAPI {
  list: () => Promise<any[]>;
  add: (id: string) => Promise<any>;
  remove: (id: string) => Promise<void>;
  check: (id: string) => Promise<boolean>;
}

export interface ConfigAPI {
  show: () => Promise<any[]>;
  get: (key: string) => Promise<{ key: string, value: any }>;
  set: (key: string, value: string) => Promise<{ success: boolean }>;
}

export interface FavoritesAPI {
  list: () => Promise<any[]>;
  add: (id: string) => Promise<any>;
  remove: (id: string) => Promise<void>;
  check: (id: string) => Promise<boolean>;
}

export interface HistoryAPI {
  list: () => Promise<any[]>;
  clear: () => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export interface RandomAPI {
  set: (options?: RandomOptions) => Promise<any>;
}

export interface SetAPI {
  history: (id: string) => Promise<void>;
  bookmark: (id: string) => Promise<void>;
  favorite: (id: string) => Promise<void>;
}

export interface SourcesAPI {
  list: () => Promise<any[]>;
}
export interface currentWallpaper {
  id: () => Promise<string>;
  check: (id: string) => Promise<boolean>
}

/**
 * Defines the complete API exposed to the Renderer.
 */
export interface IpcRendererApi {
  bookmarks: BookmarksAPI;
  config: ConfigAPI;
  favorites: FavoritesAPI;
  history: HistoryAPI;
  random: RandomAPI;
  set: SetAPI;
  sources: SourcesAPI;
  fetchAndSet: (query: { source: string, query: string }) => Promise<any>;
  current: currentWallpaper;
}
import { jest, describe, expect, test } from '@jest/globals';
import { Low } from 'lowdb';
import { AppData, Wallpaper } from './types.js';

// --- Mock Definitions ---

// Define mock types locally for the test
type MockWallpaper = {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
  };
  source: string
};

type MockAppData = {
  favorites: MockWallpaper[];
  history: MockWallpaper[];
  bookmarks: MockWallpaper[];
};

// Create a persistent mock state object
let mockDbState: MockAppData;

// Create mock functions for read/write
const mockRead = jest.fn(() => Promise.resolve());
const mockWrite = jest.fn(() => Promise.resolve());

// This is the mock 'db' instance that all functions will use
const mockDbInstance = {
  read: mockRead,
  write: mockWrite,
  data: null as MockAppData | null,
};

import type * as DatabaseModule from './database.js';

// --- Test Data ---

const defaultData: MockAppData = {
  favorites: [],
  history: [],
  bookmarks: [],
};
const wall1: MockWallpaper = {
  id: '1',
  urls: {
    raw: 'url1.jpg',
    full: 'url1.jpg',
    regular: 'url1.jpg',
    small: 'url1.jpg'
  },
  source: 'source-A'
};

const wall2: MockWallpaper = {
  id: '2',
  urls: {
    raw: 'url2.jpg',
    full: 'url2.jpg',
    regular: 'url2.jpg',
    small: 'url2.jpg'
  },
  source: 'source-B'
};

const wall3: MockWallpaper = {
  id: '3',
  urls: {
    raw: 'url3.jpg',
    full: 'url3.jpg',
    regular: 'url3.jpg',
    small: 'url3.jpg'
  },
  source: 'source-A'
};

const wall4: MockWallpaper = {
  id: '4',
  urls: {
    raw: 'url4.jpg',
    full: 'url4.jpg',
    regular: 'url4.jpg',
    small: 'url4.jpg'
  },
  source: 'source-C'
};
// --- Test Suite ---
describe('Database Service', () => {
  // Variable to hold the dynamically imported module
  let db: typeof DatabaseModule;
  let mockConfig: { getHistoryLength: jest.Mock; getDataPath: jest.Mock };

  beforeEach(async () => {
    // 1. Reset the module cache completely
    jest.resetModules();

    // 2. Apply mocks using the ESM-specific API.
    // This *must* be awaited.
    await jest.unstable_mockModule('lowdb', () => ({
      __esModule: true,
      Low: jest.fn(() => mockDbInstance),
    }));

    await jest.unstable_mockModule('./config', () => ({
      __esModule: true,
      getDataPath: jest.fn(() => '/fake/data/path'),
      getHistoryLength: jest.fn(() => 3),
    }));
    await jest.unstable_mockModule('node:fs/promises', () => ({
      __esModule: true,
      // Handles default imports like: import fs from 'node:fs/promises'
      default: {
        mkdir: jest.fn().mockResolvedValue(undefined),
        rename: jest.fn().mockResolvedValue(undefined),
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue(undefined),
      },
      // Handles named imports like: import { mkdir, rename } from 'node:fs/promises'
      mkdir: jest.fn().mockResolvedValue(undefined),
      rename: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(undefined),
    }));

    // 3. Reset the mock state and clear call history
    mockDbState = JSON.parse(JSON.stringify(defaultData));
    mockDbInstance.data = mockDbState;
    jest.clearAllMocks();

    // 4. NOW dynamically import the module.
    // It will load *after* the mocks are in place.
    db = await import('./database.js');
    mockConfig = (await import('./config.js')) as any;
  });

  // Helper check to ensure db.read() is called by every function
  const expectDbReadAndWrite = (read: number, write: number) => {
    expect(mockRead).toHaveBeenCalledTimes(read);
    expect(mockWrite).toHaveBeenCalledTimes(write);
  };

  describe('Favorites', () => {
    it('should add a favorite', async () => {
      await db.addFavorite(wall1);
      expect(mockDbState.favorites).toEqual([wall1]);
      expectDbReadAndWrite(1, 1);
    });

    it('should get all favorites', async () => {
      mockDbState.favorites = [wall1, wall2];
      const favs = await db.getFavorites();
      expect(favs).toEqual([wall1, wall2]);
      expectDbReadAndWrite(1, 0); // Get operations don't write
    });
    it('should remove a favorite by id', async () => {
      mockDbState.favorites = [wall1, wall2];
      await db.removeFavorite('1');
      expect(mockDbState.favorites).toEqual([wall2]);
      expectDbReadAndWrite(1, 1);
    });
    it('should return true if wallpaper is a favorite', async () => {
      mockDbState.favorites = [wall1];
      const isFav = await db.isFavorite('1');
      expect(isFav).toBe(true);
      expectDbReadAndWrite(1, 0);
    });
    it('should return false if wallpaper is not a favorite', async () => {
      const isFav = await db.isFavorite('99');
      expect(isFav).toBe(false);
      expectDbReadAndWrite(1, 0);
    });
  });

  describe('Bookmarks', () => {
    it('should add a bookmark', async () => {
      await db.addBookmark(wall1);
      expect(mockDbState.bookmarks).toEqual([wall1]);
      expectDbReadAndWrite(1, 1);
    });

    it('should get all bookmarks', async () => {
      mockDbState.bookmarks = [wall1, wall2];
      const bookmarks = await db.getBookmarks();
      expect(bookmarks).toEqual([wall1, wall2]);
      expectDbReadAndWrite(1, 0);
    });

    it('should remove a bookmark by id', async () => {
      mockDbState.bookmarks = [wall1, wall2];
      await db.removeBookmark('1');
      expect(mockDbState.bookmarks).toEqual([wall2]);
      expectDbReadAndWrite(1, 1);
    });

    it('should return true if wallpaper is bookmarked', async () => {
      mockDbState.bookmarks = [wall1];
      const isBooked = await db.isBookmarked('1');
      expect(isBooked).toBe(true);
      expectDbReadAndWrite(1, 0);
    });

    it('should return false if wallpaper is not bookmarked', async () => {
      const isBooked = await db.isBookmarked('99');
      expect(isBooked).toBe(false);
      expectDbReadAndWrite(1, 0);
    });
  });

  describe('History', () => {
    it('should add items to the front of the history', async () => {
      await db.addToHistory(wall1);
      await db.addToHistory(wall2);
      // wall2 was added last, so it should be first
      expect(mockDbState.history).toEqual([wall2, wall1]);
      expectDbReadAndWrite(2, 2);
    });

    it('should move an existing item to the front if added again', async () => {
      await db.addToHistory(wall1);
      await db.addToHistory(wall2);
      await db.addToHistory(wall1); // Add wall1 again
      // wall1 should now be at the front
      expect(mockDbState.history).toEqual([wall1, wall2]);
      expect(mockDbState.history.length).toBe(2);
      expectDbReadAndWrite(3, 3);
    });

    it('should enforce the history limit', async () => {
      const mockLengthFn = mockConfig.getHistoryLength as jest.Mock;
      // Check that our mock config is working
      expect(mockLengthFn()).toBe(3);

      await db.addToHistory(wall1); // [wall1]
      await db.addToHistory(wall2); // [wall2, wall1]
      await db.addToHistory(wall3); // [wall3, wall2, wall1]

      expect(mockDbState.history).toEqual([wall3, wall2, wall1]);
      expect(mockDbState.history.length).toBe(3);

      // Add one more, which should push wall1 off the end
      await db.addToHistory(wall4); // [wall4, wall3, wall2]

      expect(mockDbState.history).toEqual([wall4, wall3, wall2]);
      expect(mockDbState.history.length).toBe(3);

      // Ensure getHistoryLength was called
      expect(mockLengthFn).toHaveBeenCalled();
      expectDbReadAndWrite(4, 4);
    });

    it('should get the history', async () => {
      mockDbState.history = [wall2, wall1];
      const history = await db.getHistory();
      expect(history).toEqual([wall2, wall1]);
      expectDbReadAndWrite(1, 0);
    });

    it('should clear the history', async () => {
      mockDbState.history = [wall1, wall2];
      await db.clearHistory();
      expect(mockDbState.history).toEqual([]);
      expectDbReadAndWrite(1, 1);
    });
  });
});
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { AppData, Wallpaper } from './types.js';
import { getDataPath, getHistoryLength } from './config.js';

// Define the default structure for a new database
const defaultData: AppData = {
  favorites: [],
  history: [],
  bookmarks: [],
};

let db: Low<AppData> | null = null;

/**
 * Ensures the database is loaded from the file.
 * Call this before any db operation.
 */
async function getDb() {
  // Only initialize the db on the *first call*
  if (db === null) {
    // By the time this code runs, your test mocks ARE active.
    // getDataPath() will be the mock function.
    const dataPath = getDataPath();
    const dbPath = join(dataPath, 'db.json');
    const dbDir = dirname(dbPath); // Get the directory path

    // --- Added Logic ---
    // Ensure the directory exists before trying to read/write the file
    // { recursive: true } creates parent directories if needed
    // and doesn't throw an error if the directory already exists.
    try {
      await fs.mkdir(dbDir, { recursive: true });
    } catch (e) {
      console.error('Failed to create database directory:', e);
      // Depending on your app, you might want to re-throw the error
      // throw e;
    }
    // --- End Added Logic ---

    const adapter = new JSONFile<AppData>(dbPath);

    // new Low() will be the mock constructor.
    db = new Low(adapter, defaultData);
  }

  // This will read the file. If the file doesn't exist,
  // db.data will be populated with defaultData.
  await db.read();

  return db;
}
export async function addFavorite(id: string): Promise<Wallpaper> {
  const db = await getDb();

  // 1. Find the wallpaper in history
  const wallpaper = db.data.history.find(w => w.id === id);
  if (!wallpaper) {
    throw new Error(`Wallpaper with ID "${id}" not found in history.`);
  }

  // 2. Add to favorites if not already there
  if (!db.data.favorites.some(w => w.id === id)) {
    db.data.favorites.push(wallpaper);
    await db.write();
  }
  return wallpaper;
}

export async function getFavorites(): Promise<Wallpaper[]> {
  const db = await getDb();
  return db.data.favorites || [];
}
// --- Favorites ---

/**
 * Removes a wallpaper from the favorites list by its ID.
 * Assumes Wallpaper type has an 'id: string' property.
 */
export async function removeFavorite(id: string): Promise<void> {
  const db = await getDb();
  // Filter out the wallpaper with the matching ID
  db.data.favorites = db.data.favorites.filter(w => w.id !== id);
  await db.write();
}

/**
 * Checks if a wallpaper is already in the favorites list.
 */
export async function isFavorite(id: string): Promise<boolean> {
  const db = await getDb();
  return db.data.favorites.some(w => w.id === id);
}

// --- Bookmarks ---

/**
 * Adds a wallpaper to the bookmarks list.
 */
export async function addBookmark(id: string): Promise<Wallpaper> {
  const db = await getDb();

  // 1. Find in history
  const wallpaper = db.data.history.find(w => w.id === id);
  if (!wallpaper) {
    throw new Error(`Wallpaper with ID "${id}" not found in history.`);
  }

  // 2. Add to bookmarks if not already there
  if (!db.data.bookmarks.some(w => w.id === id)) {
    db.data.bookmarks.push(wallpaper);
    await db.write();
  }
  return wallpaper;
}

/**
 * Retrieves all bookmarked wallpapers.
 */
export async function getBookmarks(): Promise<Wallpaper[]> {
  const db = await getDb();
  return db.data.bookmarks || [];
}

/**
 * Removes a wallpaper from the bookmarks list by its ID.
 */
export async function removeBookmark(id: string): Promise<void> {
  const db = await getDb();
  db.data.bookmarks = db.data.bookmarks.filter(w => w.id !== id);
  await db.write();
}

/**
 * Checks if a wallpaper is already in the bookmarks list.
 */
export async function isBookmarked(id: string): Promise<boolean> {
  const db = await getDb();
  return db.data.bookmarks.some(w => w.id === id);
}

// --- History ---

// Define a maximum size for the history to prevent it from growing indefinitely

/**
 * Adds a wallpaper to the history.
 * This implementation prevents exact duplicates and manages history size.
 * It adds the item to the *front* of the list (most recent).
 */
export async function addToHistory(wallpaper: Wallpaper): Promise<Wallpaper> {
  const db = await getDb();

  // 1. Remove any existing instance of this wallpaper (by id)
  db.data.history = db.data.history.filter(w => w.id !== wallpaper.id);

  // 2. Add the new one to the front (most recent)
  db.data.history.unshift(wallpaper);

  const maxLength = getHistoryLength();

  // 3. Enforce max size (trim from the end)
  if (db.data.history.length > maxLength) {
    db.data.history = db.data.history.slice(0, maxLength);
  }

  await db.write();
  return wallpaper;
}

/**
 * Retrieves all wallpapers from the history (most recent first).
 */
export async function getHistory(): Promise<Wallpaper[]> {
  const db = await getDb();
  return db.data.history || [];
}

/**
 * Clears all items from the history.
 */
export async function clearHistory(): Promise<void> {
  const db = await getDb();
  db.data.history = [];
  await db.write();
}
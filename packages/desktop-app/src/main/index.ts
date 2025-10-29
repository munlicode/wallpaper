import { app, BrowserWindow, ipcMain } from 'electron';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import {
  startWallpaperService,
  addFavorite,
  getFavorites,
  removeFavorite,
  isFavorite,
  addBookmark,
  getBookmarks,
  removeBookmark,
  isBookmarked,
  addToHistory,
  getHistory,
  clearHistory,
  sourceRegistry,
  setCustomDataPath,
  getDataPath,
  getSettings,
  getSetting,
  setSetting,
  settingsMeta,
  getDefaultSettings,
  type Settings,
} from '@wallpaper/core';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const projectRoot = join(currentDir, '../../../../');

dotenv.config({ path: join(projectRoot, '.env') });
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(currentDir, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (process.env.NODE_ENV === 'development') {
    console.info("Starting Dev Sever")
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    console.info("Starting Production Sever")
    win.loadFile(join(currentDir, '../renderer/index.html'));
  }
}

// Listen for messages from the UI and call core functions
ipcMain.handle('get-favorites', async () => {
  console.log('get-favorites called');
  return await getFavorites();
});

app.whenReady().then(async () => {
  createWindow();

  startWallpaperService();

  ipcMain.handle('get-history', async () => {
    return await getHistory();
  });

  //TODO:  ... create more handlers for addFavorite, etc.
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
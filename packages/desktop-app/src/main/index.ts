import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

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

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Attach the preload script
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  startWallpaperService();

  // Listen for messages from the UI and call core functions
  ipcMain.handle('get-favorites', async () => {
    return await getFavorites();
  });

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
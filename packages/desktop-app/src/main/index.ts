process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

import { app, BrowserWindow } from 'electron';
import * as dotenv from 'dotenv';
import {
  startWallpaperService,
} from '@wallpaper/core';
import { registerIPCHandlers } from './handlers/index.js';
import { createMenu } from './menu.js';
import path from 'path';

const currentDir = __dirname;
const projectRoot = path.join(currentDir, '../../../../');


dotenv.config({ path: path.join(projectRoot, '.env') });
const preloadPath = path.join(__dirname, '../preload/index.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    },
  });
  if (process.env.NODE_ENV === 'development') {
    console.info("Starting Dev Sever")
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    console.info("Starting Production Sever")
    win.loadFile(path.join(currentDir, '../renderer/index.html'));
  }
}


app.whenReady().then(async () => {
  createWindow();

  createMenu();
  startWallpaperService();

  registerIPCHandlers();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
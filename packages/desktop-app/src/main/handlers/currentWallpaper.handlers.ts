import {
  getCurrentWallpaper,
} from '@wallpaper/core';
import { ipcMain } from 'electron';


export function registerCurrentWallpaperHandlers() {
  ipcMain.handle("wallpaper:current:id", async () => {
    const current = await getCurrentWallpaper();
    return current?.id;
  })
  ipcMain.handle("wallpaper:current:check", async (_event, id: string) => {
    const current = await getCurrentWallpaper();
    return id === current?.id
  })
};

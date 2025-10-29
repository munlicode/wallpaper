import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe, limited API to the renderer process
contextBridge.exposeInMainWorld('api', {
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  //TODO: ... add more for addFavorite, etc.
});
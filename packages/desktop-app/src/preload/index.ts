import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload loaded');
contextBridge.exposeInMainWorld('api', {
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  //TODO: ... add more for addFavorite, etc.
});
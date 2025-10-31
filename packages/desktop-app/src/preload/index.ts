import { contextBridge, ipcRenderer } from "electron";
import { IpcRendererApi } from "../shared/ipc-channels";

const IPC_STRUCTURE = {
  bookmarks: [
    'list',
    'add',
    'remove',
    'check',
  ],
  config: [
    'show',
    'get',
    'set',
  ],
  favorites: [
    'list',
    'add',
    'remove',
    'check',
  ],
  history: ['list', 'clear', 'delete'],
  random: ['set'],
  set: ['history', 'bookmark', 'favorite',],
  sources: ['list'],
  fetchAndSet: null,
  current: ['id', 'check']
};

const api: Partial<IpcRendererApi> = {};

function buildApi(structure: any, parentKey: string | null, targetObj: any) {
  for (const key in structure) {
    const value = structure[key];

    if (Array.isArray(value)) {
      targetObj[key as keyof IpcRendererApi] = {};
      const namespaceObj = targetObj[key as keyof IpcRendererApi];

      value.forEach(action => {
        const channel = parentKey ? `${parentKey}:${key}:${action}` : `${key}:${action}`;
        const ipcChannel = `wallpaper:${channel}`;

        namespaceObj[action] = (...args: any[]) => {
          return ipcRenderer.invoke(ipcChannel, ...args);
        };
      });

    } else if (value === null) {
      const ipcChannel = `wallpaper:${key}`;

      targetObj[key as keyof IpcRendererApi] = (...args: any[]) => {
        return ipcRenderer.invoke(ipcChannel, ...args);
      };

    }
  }
}

buildApi(IPC_STRUCTURE, null, api);

contextBridge.exposeInMainWorld('wallpaperAPI', api);
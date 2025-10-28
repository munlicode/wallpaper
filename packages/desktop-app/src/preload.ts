import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("wallpaperAPI", {
  hello: () => console.log("Hello from preload!")
});

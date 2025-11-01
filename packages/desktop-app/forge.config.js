import path from "path";
import { utils } from "@electron-forge/core";

export default {
  buildIdentifier: process.env.BUILD_TYPE || "prod",

  packagerConfig: {
    name: "WallpaperApp",
    asar: true,                       // bundle source into a single .asar
    icon: path.resolve("./assets/icon"), // without extension; Forge adds .ico/.icns automatically
    overwrite: true,
  },

  rebuildConfig: {
    force: true,                      // always rebuild native modules
  },

  makers: [
    {
      name: "@electron-forge/maker-zip", // produces .zip archives for any platform
      platforms: ["darwin", "linux", "win32"],
    },
    {
      name: "@electron-forge/maker-squirrel", // Windows installer
      config: {
        name: "wallpaper",
        authors: "Nurzhan Muratkhan",
        description: "Wallpaper CLI + GUI",
      },
    },
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'munlicode',
          name: 'wallpaper',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
  plugins: [
  ],

  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      console.log("✅ Files copied to:", buildPath);
    },
  },
};

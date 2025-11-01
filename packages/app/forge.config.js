module.exports = {
  packagerConfig: {
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/,
    ],
  },
  rebuildConfig: {},
  // packagerConfig: {
  //   name: "WallpaperApp",
  //   asar: true,                       // bundle source into a single .asar
  //   icon: path.resolve("./assets/icon"), // without extension; Forge adds .ico/.icns automatically
  //   overwrite: true,
  //   ignore: [
  //     /^\/src/,
  //     /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/,
  //   ],
  // },

  // rebuildConfig: {
  //   force: true,                      // always rebuild native modules
  // },

  makers: [
    // {
    //   name: '@electron-forge/maker-snap',
    //   config: {
    //     features: {
    //       network: true,
    //     },
    //     summary: 'A simple yet powerful tool designed to transform your workspace with ease. Wallpaper lets you effortlessly manage your desktop backgrounds — fetch new wallpapers by keyword, source, or category, schedule automatic updates, or quickly apply local images via the command line.',
    //   },
    // },

    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],

  // publishers: [
  //   {
  //     name: '@electron-forge/publisher-github',
  //     config: {
  //       repository: {
  //         owner: 'munlicode',
  //         name: 'wallpaper',
  //       },
  //       prerelease: false,
  //       draft: true,
  //     },
  //   },
  // ],
  // plugins: [
  // ],

  // hooks: {
  //   packageAfterCopy: async (_config, buildPath) => {
  //     console.log("✅ Files copied to:", buildPath);
  //   },
  // },
};

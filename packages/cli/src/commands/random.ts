import { randomWallpaper } from "@munlicode/munliwall-core";

export const RandomCommand = {
  command: "random",
  describe: "Choose a random wallpaper from the selected category",

  builder: (yargs: any) =>
    yargs
      .option("favorites", {
        alias: "f",
        type: "boolean",
        describe: "Pick from favorites only",
      })
      .option("history", {
        alias: "h",
        type: "boolean",
        describe: "Pick from history only",
      })
      .option("bookmarks", {
        alias: "b",
        type: "boolean",
        describe: "Pick from bookmarks only",
      })
      .option("all", {
        alias: "a",
        type: "boolean",
        describe: "Pick from all available wallpapers",
      })
      .conflicts({
        favorites: ["history", "bookmarks", "all"],
        history: ["favorites", "bookmarks", "all"],
        bookmarks: ["favorites", "history", "all"],
      })
      .example("wallpaper random -f", "Pick a random favorite wallpaper")
      .example("wallpaper random -a", "Pick from all available wallpapers"),

  handler: async (argv: any) => {
    const mode =
      (argv.favorites && "favorites") ||
      (argv.history && "history") ||
      (argv.bookmarks && "bookmarks") ||
      "all";

    try {
      await randomWallpaper(mode);
      console.log(`🎨 Wallpaper set from: ${mode}`);
    } catch (err) {
      console.error("❌ Failed to set wallpaper:", err);
      process.exitCode = 1;
    }
  },
};

import { getBookmarks, getFavorites, getHistory, setWallpaperFromList, type Wallpaper } from "@munlicode/munliwall-core";

export const SetCommand = {
  command: "set",
  describe: "Set wallpaper from history, bookmarks, or favorites",
  builder: (yargs: any) =>
    yargs
      // --- History Subcommand ---
      .command(
        'history <id>',
        'Set a wallpaper from history',
        (yargs: any) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv: any) => {
          const history = await getHistory();
          await setWallpaperFromList(argv.id, history, 'History');
        }
      )

      // --- Bookmark Subcommand ---
      .command(
        'bookmark <id>',
        'Set a wallpaper from your bookmarks',
        (yargs: any) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv: any) => {
          // You'll need to create this function
          const bookmarks = await getBookmarks();
          await setWallpaperFromList(argv.id, bookmarks, 'Bookmarks');
        }
      )

      // --- Favorite Subcommand ---
      .command(
        'favorite <id>',
        'Set a wallpaper from your favorites',
        (yargs: any) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv: any) => {
          const favorites = await getFavorites();
          await setWallpaperFromList(argv.id, favorites, 'Favorites');
        }
      ),

  handler: (argv: any) => {
    // This handler runs if they just type 'set' with no subcommand
    console.log('Please specify a source to set from: history, bookmark, or favorite.');
  },
};


import { addBookmark, getBookmarks, getCurrentWallpaper, removeBookmark } from "@wallpaper/core";
import type { Wallpaper } from "@wallpaper/core";

export const BookmarksCommand = {
  command: "bookmarks <action>",
  describe: "Manage your bookmarked wallpapers",
  builder: (yargs: any) =>
    yargs
      .command(
        'list',
        'List all bookmarked wallpapers',
        {}, // No options for 'list'
        async () => {
          console.log('Loading bookmarks...');
          const bookmarks = await getBookmarks();
          if (bookmarks.length === 0) {
            console.log('You have no bookmarks yet.');
            return;
          }
          console.table(
            bookmarks.map((b: Wallpaper) => ({
              id: b.id,
              source: b.source,
              author: b.author,
              urlFull: b.urls.full,
            }))
          );
        }
      )
      .command(
        'add <id> or current',
        'Add a wallpaper from history to bookmarks',
        (yargs: any) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
        async (argv: any) => {
          try {
            let id
            let wallpaper;

            if (argv.id === "current") {
              wallpaper = await getCurrentWallpaper();
              id = wallpaper?.id
            } else {
              id = argv.id
            }
            wallpaper = await addBookmark(id);

            console.log(`Added ${wallpaper.id} to bookmarks.`);
          } catch (err) {
            if (err instanceof Error) {
              console.error(`❌ Error: ${err.message}`);
            } else {
              console.error('❌ An unknown error occurred:', err);
            }
          }
        }
      )

      .command(
        'remove <id>',
        'Remove a wallpaper from bookmarks',
        (yargs: any) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
        async (argv: any) => {
          await removeBookmark(argv.id as string);
          console.log(`Removed ${argv.id} from bookmarks.`);
        }
      )
      .demandCommand(1, 'You must provide an action for bookmarks (list, add, remove).'),

  handler: (argv: any) => {
    // Runs if user just types "favorites" without a subcommand
    console.log(`Unknown action: ${argv.action}`);
    console.log("Try one of: list, add <id>, remove <id>");
  },
};


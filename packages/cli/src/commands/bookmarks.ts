import { addBookmark, getBookmarks, getCurrentWallpaper, removeBookmark } from "@munlicode/munliwall-core";
import type { Wallpaper } from "@munlicode/munliwall-core";
import { handleAddAction } from "../helpers.js";

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
        "add <id>",
        "Add a wallpaper from history to bookmarks (use 'current' to add current wallpaper)",
        (yargs: any) =>
          yargs.positional("id", {
            type: "string",
            describe: "The ID of the wallpaper, or 'current' to use the current wallpaper",
          }),
        async (argv: any) => {
          await handleAddAction(
            argv.id,
            addBookmark,
            "Added to bookmarks"
          );
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
    // Runs if user just types "bookmarks" without a subcommand
    console.log(`Unknown action: ${argv.action}`);
    console.log("Try one of: list, add <id>, remove <id>");
  },
};


import { getFavorites, addFavorite, removeFavorite, getCurrentWallpaper } from "@munlicode/munliwall-core";
import type { Wallpaper } from "@munlicode/munliwall-core";
import { handleAddAction } from "../helpers.js";

export const FavoritesCommand = {
  command: "favorites <action>",
  describe: "Manage your favorite wallpapers",
  builder: (yargs: any) =>
    yargs
      .command(
        "list",
        "List all favorite wallpapers",
        () => { }, // no options for 'list'
        async () => {
          console.log("Loading favorites...");
          const favorites = await getFavorites();

          if (!favorites || favorites.length === 0) {
            console.log("You have no favorites yet.");
            return;
          }

          console.table(
            favorites.map((f: Wallpaper) => ({
              id: f.id,
              source: f.source,
              author: f.author,
              urlFull: f.urls.full,
            }))
          );
        }
      )

      .command(
        "add <id>",
        "Add a wallpaper from history to favorites (use 'current' to add current wallpaper)",
        (yargs: any) =>
          yargs.positional("id", {
            type: "string",
            describe: "The ID of the wallpaper, or 'current' to use the current wallpaper",
          }),
        async (argv: any) => {
          // One line of execution!
          await handleAddAction(
            argv.id,
            addFavorite,
            "Added to favorites"
          );
        }
      )
      .command(
        "remove <id>",
        "Remove a wallpaper from favorites",
        (yargs: any) =>
          yargs.positional("id", {
            type: "string",
            describe: "The ID of the wallpaper",
            demandOption: true,
          }),
        async (argv: any) => {
          try {
            await removeFavorite(argv.id as string);
            console.log(`🗑️ Removed "${argv.id}" from favorites.`);
          } catch (err) {
            if (err instanceof Error) {
              console.error(`❌ Error: ${err.message}`);
            } else {
              console.error("❌ An unknown error occurred:", err);
            }
          }
        }
      )

      .demandCommand(1, "You must provide an action for favorites (list, add, remove)."),

  handler: (argv: any) => {
    // Runs if user just types "favorites" without a subcommand
    console.log(`Unknown action: ${argv.action}`);
    console.log("Try one of: list, add <id>, remove <id>");
  },
};

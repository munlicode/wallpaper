import { getFavorites, addFavorite, removeFavorite, getCurrentWallpaper } from "@wallpaper/core";
import type { Wallpaper } from "@wallpaper/core";

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
        "add <id> or current",
        "Add a wallpaper from history to favorites",
        (yargs: any) =>
          yargs.positional("id", {
            type: "string",
            describe: "The ID of the wallpaper",
            demandOption: true,
          }),
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
            wallpaper = await addFavorite(id);
            console.log(`✅ Added "${wallpaper.id}" to favorites.`);
          } catch (err) {
            if (err instanceof Error) {
              console.error(`❌ Error: ${err.message}`);
            } else {
              console.error("❌ An unknown error occurred:", err);
            }
          }
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

import { clearHistory, getHistory } from "@wallpaper/core";
import type { Wallpaper } from "@wallpaper/core";

export const HistoryCommand = {
  command: "history <action>",
  describe: "View your wallpaper history",
  builder: (yargs: any) =>
    yargs
      .command(
        'list',
        'List recently used wallpapers',
        {}, // No options for 'list'
        async () => {
          console.log('Loading history...');
          const history = await getHistory();
          if (history.length === 0) {
            console.log('You have no history yet.');
            return;
          }
          console.table(
            history.map((h: Wallpaper) => ({
              id: h.id,
              source: h.source,
              author: h.author,
              urlFull: h.urls.full,
            }))
          );
        }
      )

      .command(
        'clear',
        'Clear all wallpaper history',
        {},
        async () => {
          await clearHistory();
          console.log('Wallpaper history cleared.');
        }
      )
      .demandCommand(1, 'You must provide an action for history (list, clear).'),

  handler: (argv: any) => {
    // Runs if user just types "favorites" without a subcommand
    console.log(`Unknown action: ${argv.action}`);
    console.log("Try one of: list, add <id>, remove <id>");
  },
};

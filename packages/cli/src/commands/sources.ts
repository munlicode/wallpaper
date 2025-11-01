import { sourceRegistry } from "@munlicode/core";

export const SourcesCommand = {
  command: "sources <action>",
  describe: "Manage wallpaper sources",
  builder: (yargs: any) =>
    yargs.command(
      "list",
      "List all available wallpaper sources",
      () => { }, // no extra options for 'list'
      () => {
        console.log("Available Sources:");

        if (sourceRegistry.size === 0) {
          console.log("  (No sources registered)");
          return;
        }

        for (const sourceName of sourceRegistry.keys()) {
          console.log(`  - ${sourceName}`);
        }
      }
    ),

  handler: (argv: any) => {
    // This handler only runs if no subcommand (like 'list') is provided
    console.log(`Unknown action: ${argv.action}`);
    console.log("Try running: wallpaper-dev sources list");
  },
};

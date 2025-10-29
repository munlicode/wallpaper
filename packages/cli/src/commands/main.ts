import { getAndSetWallpaper } from "@wallpaper/core";
import type { FetchQuery } from "@wallpaper/core";


export const MainCommand = {
  command: "$0 [query]",
  describe: "Fetch and set a new wallpaper",
  builder: (yargs: any, availableSources: string[]) =>
    yargs
      .positional("query", {
        describe: 'Keyword, mood, or URL (e.g., "dark nature")',
        type: "string",
        default: "random",
      })
      .option("source", {
        alias: "s",
        type: "string",
        describe: "The source to fetch from",
        default: "nekos",
        choices: availableSources,
      }),

  handler: async (argv: any) => {
    console.log(`🔎 Fetching wallpaper for "${argv.query}" from [${argv.source}]...`);

    const query: FetchQuery = {
      source: argv.source,
      query: argv.query,
    };

    try {
      const wallpaper = await getAndSetWallpaper(query);

      console.log(`✅ Success! Set wallpaper from ${wallpaper.source}`);

      if (wallpaper.author) {
        console.log(`   Artist: ${wallpaper.author}`);
      }

      console.log(`   ID: ${wallpaper.id}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Error: ${err.message}`);
      } else {
        console.error("❌ An unknown error occurred:", err);
      }
      process.exit(1);
    }
  },
};

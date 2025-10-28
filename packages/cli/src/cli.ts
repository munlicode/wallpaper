#!/usr/bin/env node

// 1. LOAD ENV VARIABLES FIRST
// This loads the .env file from your project root
import 'dotenv/config';

// 2. Import CLI and Core libraries
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  // Main workflow
  getAndSetWallpaper,
  setWallpaperFromList,

  // Database functions
  getFavorites,
  addFavorite,
  removeFavorite,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getHistory,
  clearHistory,

  // Types
  type FetchQuery,
  type Wallpaper,
} from '@wallpaper/core';

// 3. Define your commands
yargs(hideBin(process.argv))
  // The main command
  .command(
    '$0 [query]', // $0 makes this the default command
    'Fetch and set a new wallpaper',
    (yargs) => {
      // Setup options for this command
      return yargs
        .positional('query', {
          describe: 'Keyword, mood, or URL (e.g., "dark nature")',
          type: 'string',
          default: 'random',
        })
        .option('source', {
          alias: 's',
          type: 'string',
          describe: 'The source (e.g., unsplash, local)',
          default: 'local',
        });
    },
    async (argv) => {
      // This is the action that runs
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
        // Print the ID so the user can use it
        console.log(`   ID: ${wallpaper.id}`);
      } catch (err) {
        if (err instanceof Error) {
          console.error(`❌ Error: ${err.message}`);
        } else {
          console.error('❌ An unknown error occurred:', err);
        }
        process.exit(1);
      }
    }
  )

  // A command group for 'favorites'
  .command(
    'favorites <action>',
    'Manage your favorite wallpapers',
    (yargs) => {
      return yargs
        .command(
          'list',
          'List all favorite wallpapers',
          {}, // No options for 'list'
          async () => {
            console.log('Loading favorites...');
            const favorites = await getFavorites();
            if (favorites.length === 0) {
              console.log('You have no favorites yet.');
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
          'add <id>',
          'Add a wallpaper from history to favorites',
          (yargs) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
          async (argv) => {
            try {
              const wallpaper = await addFavorite(argv.id as string);
              console.log(`Added ${wallpaper.id} to favorites.`);
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
          'Remove a wallpaper from favorites',
          (yargs) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
          async (argv) => {
            await removeFavorite(argv.id as string);
            console.log(`Removed ${argv.id} from favorites.`);
          }
        )
        .demandCommand(1, 'You must provide an action for favorites (list, add, remove).');
    }
  )

  // A command group for 'bookmarks'
  .command(
    'bookmarks <action>',
    'Manage your bookmarked wallpapers',
    (yargs) => {
      return yargs
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
          'add <id>',
          'Add a wallpaper from history to bookmarks',
          (yargs) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
          async (argv) => {
            try {
              const wallpaper = await addBookmark(argv.id as string);
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
          (yargs) => yargs.positional('id', { type: 'string', describe: 'The ID of the wallpaper', demandOption: true }),
          async (argv) => {
            await removeBookmark(argv.id as string);
            console.log(`Removed ${argv.id} from bookmarks.`);
          }
        )
        .demandCommand(1, 'You must provide an action for bookmarks (list, add, remove).');
    }
  )

  // A command group for 'history'
  .command(
    'history <action>',
    'View your wallpaper history',
    (yargs) => {
      return yargs
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
        .demandCommand(1, 'You must provide an action for history (list, clear).');
    }
  )
  .command(
    'set', // This is the parent 'set' command
    'Set wallpaper from history, bookmarks, or favorites',
    (yargs) => {

      // --- History Subcommand ---
      yargs.command(
        'history <id>',
        'Set a wallpaper from history',
        (yargs) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv) => {
          const history = await getHistory();
          await setWallpaperFromList(argv.id, history, 'History');
        }
      );

      // --- Bookmark Subcommand ---
      yargs.command(
        'bookmark <id>',
        'Set a wallpaper from your bookmarks',
        (yargs) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv) => {
          // You'll need to create this function
          const bookmarks = await getBookmarks();
          await setWallpaperFromList(argv.id, bookmarks, 'Bookmarks');
        }
      );

      // --- Favorite Subcommand ---
      yargs.command(
        'favorite <id>',
        'Set a wallpaper from your favorites',
        (yargs) =>
          yargs.positional('id', {
            type: 'string',
            describe: 'The ID of the wallpaper',
            demandOption: true
          }),
        async (argv) => {
          // You'll need to create this function
          const favorites = await getFavorites();
          await setWallpaperFromList(argv.id, favorites, 'Favorites');
        }
      );

    },
    () => {
      // This handler runs if they just type 'set' with no subcommand
      console.log('Please specify a source to set from: history, bookmark, or favorite.');
      // You can also show yargs.help() here
    }
  )
  .demandCommand(1, 'Please provide a command or run without args to fetch a wallpaper.')
  .strict() // Show an error for unknown commands or options
  .help() // Enable the --help flag
  .parse(); // Start parsing the arguments
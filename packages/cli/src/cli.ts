#!/usr/bin/env node

import 'dotenv/config';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  // Sources
  sourceRegistry,
} from '@wallpaper/core';
import { configCommand } from './commands/config.js';
import { SourcesCommand } from './commands/sources.js';
import { FavoritesCommand } from './commands/favorites.js';
import { BookmarksCommand } from './commands/bookmarks.js';
import { HistoryCommand } from './commands/history.js';
import { SetCommand } from './commands/set.js';
import { MainCommand } from './commands/main.js';
import { RandomCommand } from './commands/random.js';
const availableSources = Array.from(sourceRegistry.keys());

yargs(hideBin(process.argv))
  .scriptName("wallpaper")

  // The main command
  .command(MainCommand.command, MainCommand.describe, (y) => MainCommand.builder(y, availableSources), MainCommand.handler)
  .command(SourcesCommand)

  // A command group for 'favorites'
  .command(FavoritesCommand)

  // A command group for 'bookmarks'
  .command(BookmarksCommand)

  // A command group for 'history'
  .command(HistoryCommand)

  .command(SetCommand)
  .command(configCommand)
  .command(RandomCommand)

  .demandCommand(1, 'Please provide a command or run without args to fetch a wallpaper.')
  .strict() // Show an error for unknown commands or options
  .help() // Enable the --help flag
  .parse(); // Start parsing the arguments
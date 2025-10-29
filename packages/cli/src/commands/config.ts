
import { ArgumentsCamelCase } from 'yargs';
import {
  getSettings,
  settingsMeta,
  getDefaultSettings,
  Settings,
  setSetting,
  getSetting
} from '@wallpaper/core';


type ConfigHandlers = {
  show: () => Promise<void>
  get: (key?: string) => Promise<void>
  set: (key?: string, value?: string) => Promise<void>
}

export const configHandlers: ConfigHandlers = {
  async show() {
    console.log("⚙️  Current configuration:\n");
    const settings = getSettings();

    for (const [key, meta] of Object.entries(settingsMeta)) {
      const current = settings.get(key as keyof Settings);
      const def = (getDefaultSettings() as any)[key];

      console.log(`• ${key}`);
      console.log(`   ${meta.description}`);
      console.log(`   Type: ${meta.type}`);
      if (meta.choices) console.log(`   Choices: ${meta.choices.join(", ")}`);
      console.log(`   Value: ${current ?? def} (default: ${def})\n`);
    }
  },

  async get(key?: string) {
    if (!key) return console.error("❌ Please specify a key to get.");
    if (!(key in settingsMeta)) return console.error(`⚠️ Unknown key "${key}".`);
    const value = getSetting(key as keyof Settings)
    console.log(`${key} = ${value}`);
  },

  async set(key?: string, value?: string) {
    if (!key || !value) return console.error("❌ Usage: config set <key> <value>");
    if (!(key in settingsMeta)) return console.error(`⚠️ Unknown key "${key}".`);

    setSetting(key as keyof Settings, value);
    console.log(`✅ Updated ${key} to "${value}"`);
  },
};


type ConfigAction = keyof typeof configHandlers;

export const configCommand = {
  command: 'config <action> [key] [value]',
  describe: 'Manage application configuration',
  builder: (yargs: any) =>
    yargs
      .positional('action', {
        describe: 'Action to perform',
        choices: Object.keys(configHandlers) as ConfigAction[],
      })
      .positional('key', { describe: 'Configuration key', type: 'string' })
      .positional('value', { describe: 'New value to set', type: 'string' })
      .example('$0 config get dataPath', 'Show the current data path')
      .example('$0 config set dataPath ./data.json', 'Set a new data path')
      .example('$0 config show', 'Show the path to the config file'),

  handler: async (argv: ArgumentsCamelCase<any>) => {
    // cast argv to our internal type
    const { action, key, value } = argv as ArgumentsCamelCase<{
      action: ConfigAction
      key?: string
      value?: string
    }>

    const handler = configHandlers[action]
    if (!handler) {
      console.error(
        `❌ Unknown action "${action}". Use one of: ${Object.keys(configHandlers).join(', ')}`
      )
      process.exit(1)
    }

    try {
      await handler(key, value)
    } catch (err) {
      console.error(`💥 Config error: ${(err as Error).message}`)
      process.exit(1)
    }
  },
}
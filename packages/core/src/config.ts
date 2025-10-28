import Conf from 'conf';
import { homedir } from 'os';
import { join } from 'path';

// 1. Define the 'shape' of your settings
interface Settings {
  dataPath: string;
  defaultSource: string;
  historyLength: number;
  autoChangeInterval: number; // (in minutes, 0 to disable)
  imageQuality: 'auto' | 'raw' | 'full' | 'regular' | 'small';
}

// 2. Define the default settings
const defaults: Settings = {
  // Default path for the db.json and downloaded images
  dataPath: join(homedir(), '.wallpaper-tool'),
  defaultSource: 'local',
  historyLength: 50,
  autoChangeInterval: 0,
  imageQuality: 'auto',
};

// 3. Create and export the config manager
export const config = new Conf<Settings>({
  projectName: 'wallpaper-tool',
  defaults: defaults,
});

// 4. Create helper functions so your app can change settings
export function setCustomDataPath(newPath: string) {
  // You would add validation here (e.g., does the path exist?)
  config.set('dataPath', newPath);
  console.log(`Data path updated to: ${newPath}`);

  // IMPORTANT: You'd also need to tell 'lowdb' to move
  // or reload from this new path.
}

export function getDataPath(): string {
  return config.get('dataPath');
}

export function getHistoryLength(): number {
  return config.get('historyLength');
}

export function setHistoryLength(length: number) {
  config.set('historyLength', length > 0 ? length : 0); // Add validation
}
export function getImageQuality(): Settings['imageQuality'] {
  return config.get('imageQuality');
}
export function getAutoChangeInterval(): Settings['autoChangeInterval'] {
  return config.get('autoChangeInterval');
}
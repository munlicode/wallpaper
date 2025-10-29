import { getAndSetWallpaper } from './index.js';
import { getAutoChangeInterval, getAutoChangeQuery } from './config.js';

// This variable will hold the reference to our timer
let intervalId: NodeJS.Timeout | null = null;

/**
 * Runs the auto-change logic once.
 */
async function runAutoChange() {
  console.log('Scheduler: Running auto-change...');
  try {
    const query = getAutoChangeQuery();
    await getAndSetWallpaper(query);
    console.log('Scheduler: Wallpaper changed successfully.');
  } catch (err) {
    console.error('Scheduler: Error during auto-change:', err);
  }
}

/**
 * Stops the auto-change service.
 */
export function stopWallpaperService() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Scheduler: Service stopped.');
  }
}

/**
 * Starts the auto-change service.
 * It will run immediately once, then start the timer.
 */
export function startWallpaperService() {
  // Stop any existing service before starting a new one
  stopWallpaperService();

  const intervalMinutes = getAutoChangeInterval();

  // Do nothing if the interval is disabled (0 or less)
  if (intervalMinutes <= 0) {
    console.log('Scheduler: Auto-change is disabled.');
    return;
  }

  console.log(`Scheduler: Starting service with ${intervalMinutes} minute interval.`);

  const intervalMs = intervalMinutes * 60 * 1000;

  // 1. Run immediately on start
  runAutoChange();

  // 2. Set the interval for future runs
  intervalId = setInterval(runAutoChange, intervalMs);
}

/**
 * A helper to easily restart the service, e.g., after settings change.
 */
export function restartWallpaperService() {
  console.log('Scheduler: Restarting service...');
  stopWallpaperService();
  startWallpaperService();
}
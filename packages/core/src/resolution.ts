import { exec } from 'child_process';
import { promisify } from 'util';
import { ResolutionFn, Wallpaper } from './types.js';
import { getImageQuality } from './config.js';

const execAsync = promisify(exec);

/**
 * Parses a string like "1920x1080" into an object.
 */
function parseResolution(resString: string): { width: number; height: number } | null {
  // Use a regex to find "WIDTHxHEIGHT"
  const match = resString.match(/(\d+)x(\d+)/);
  if (match && match[1] && match[2]) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  return null;
}

/**
 * Fetches the primary screen's resolution using native system commands.
 * This avoids C++ dependencies like robotjs.
 */
export const getScreenResolution: ResolutionFn = async () => {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      // Windows
      const { stdout } = await execAsync('wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution /format:value');
      // Output is like:
      // CurrentHorizontalResolution=1920
      // CurrentVerticalResolution=1080
      const widthMatch = stdout.match(/CurrentHorizontalResolution=(\d+)/);
      const heightMatch = stdout.match(/CurrentVerticalResolution=(\d+)/);
      if (widthMatch && heightMatch) {
        return {
          width: parseInt(widthMatch[1], 10),
          height: parseInt(heightMatch[1], 10),
        };
      }
    } else if (platform === 'darwin') {
      // macOS
      const { stdout } = await execAsync('system_profiler SPDisplaysDataType | grep Resolution');
      // Output is like: "Resolution: 1920 x 1080"
      return parseResolution(stdout);

    } else if (platform === 'linux') {
      // Linux (X11)
      // This requires 'x11-utils' (xdpyinfo) or 'xrandr' to be installed.
      // This is a much more reasonable dependency for a wallpaper tool.
      try {
        const { stdout } = await execAsync("xrandr | grep '*' | head -n 1 | awk '{print $1}'");
        // Output is like: "1920x1080"
        return parseResolution(stdout);
      } catch (e) {
        console.warn("getScreenResolution: 'xrandr' failed, trying 'xdpyinfo'...");
        const { stdout } = await execAsync("xdpyinfo | grep dimensions | awk '{print $2}'");
        // Output is like: "1920x1080"
        return parseResolution(stdout);
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`getScreenResolution: Failed to get resolution: ${err.message}`);
    } else {
      console.error('getScreenResolution: An unknown error occurred.', err);
    }
  }

  // Fallback
  return null;
}

/**
 * Selects the optimal URL.
 * @param wallpaper The wallpaper object.
 * @param resolutionFn An optional async function to get screen resolution.
 * If not provided, 'auto' quality will default to 'full'.
 */
export async function selectOptimalUrl(
  wallpaper: Wallpaper,
  resolutionFn?: ResolutionFn, // <-- The injected dependency
): Promise<string> {
  const quality = getImageQuality();

  // 1. If user forced a quality, return that.
  if (quality !== 'auto') {
    // This part is unchanged and works great
    return wallpaper.urls[quality];
  }

  // 2. If 'auto' but no resolution function was provided (e.g., in CLI),
  // we can't detect screen size, so we default to 'full'.
  if (!resolutionFn) {
    return wallpaper.urls.full;
  }

  // 3. If 'auto' AND we have a resolution function, try to use it.
  try {
    const res = await resolutionFn(); // <-- Use the provided function

    if (res && res.width > 1920) {
      return wallpaper.urls.full;
    }
    return wallpaper.urls.regular;

  } catch (err) {
    // Fallback if the *provided* function fails
    console.error('Screen resolution function failed, defaulting to "full".', err);
    return wallpaper.urls.full;
  }
}
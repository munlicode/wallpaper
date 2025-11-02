// This function handles the 'current' logic and the common error structure.

import { getCurrentWallpaper, Wallpaper } from "@munlicode/munliwall-core";

type CoreActionFunction = (id: string) => Promise<Wallpaper>;

/**
 * Handles the logic for CLI commands that take a wallpaper ID or 'current' 
 * and call a Core action function (like addFavorite or addBookmark).
 */
export async function handleAddAction(
  id: string,
  coreAction: CoreActionFunction,
  successMsgPrefix: string
) {
  try {
    let wallpaperId = id;

    if (id === "current") {
      const wallpaper = await getCurrentWallpaper();
      if (!wallpaper || !wallpaper.id) {
        throw new Error("No current wallpaper found or wallpaper has no ID.");
      }
      wallpaperId = wallpaper.id;
    }

    // Call the specific core action function passed as an argument
    const added = await coreAction(wallpaperId);
    console.log(`✅ ${successMsgPrefix} "${added.id}".`);

  } catch (err) {
    // Standard CLI error output
    console.error(
      `❌ Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
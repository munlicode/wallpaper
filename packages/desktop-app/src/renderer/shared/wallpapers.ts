export type WallpaperMode = keyof typeof window.wallpaperAPI.set;
export const handleSet = async (wallpaperId: string, mode: WallpaperMode,
  setStatusMessage: (msg: string) => void,
  setStatusColor: (color: string) => void,
  setNewBookmarkId: (id: string) => void
) => {
  if (!wallpaperId.trim()) {
    setStatusMessage('⚠️ Please enter an ID to set wallpaper.');
    setStatusColor('orange');
    return;
  }

  // validate mode
  if (!(mode in window.wallpaperAPI.set)) {
    setStatusMessage('⚠️ Please enter a valid mode to set wallpaper.');
    setStatusColor('orange');
    return;
  }

  setStatusMessage(`🎨 Setting wallpaper (${mode}): ${wallpaperId}...`);
  setStatusColor('blue');

  try {
    // dynamic function call
    await window.wallpaperAPI.set[mode](wallpaperId);

    setStatusMessage(`✅ Wallpaper set successfully: ${wallpaperId}!`);
    setStatusColor('green');
    setNewBookmarkId('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatusMessage(`❌ Failed to set wallpaper: ${message}`);
    setStatusColor('red');
  }
};
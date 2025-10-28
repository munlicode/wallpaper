import { jest, describe, expect, test } from '@jest/globals';
import { Wallpaper } from '../types.js';
import { join } from 'path';

// --- Mocks ---
const mockReaddir = jest.fn();

jest.unstable_mockModule('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),

  readdir: mockReaddir,
}));

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: (...args: string[]) => args.join('/'),
}));

let LocalSource: any;

// --- Test Suite ---
describe('LocalSource', () => {
  let source: any; // We can't type this yet
  let mathRandomSpy: jest.SpyInstance;

  // Use 'async' because we will 'await import'
  beforeEach(async () => {
    // 7. CRITICAL: Clear Jest's module cache.
    // This forces all modules to be re-imported.
    jest.resetModules();

    // 8. Dynamically import the class *after* mocks are set up.
    // This will now find the mock we defined with unstable_mockModule.
    const module = await import('./local.js');
    LocalSource = module.LocalSource;

    // 9. Now we can create the instance
    source = new LocalSource();

    // 10. Mock Math.random
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    // 11. Clear the mock *after* setup, before the test runs.
    mockReaddir.mockClear();
  });

  afterEach(() => {
    // Restore the original Math.random implementation
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore();
    }
  });

  // --- Basic Functionality ---

  it('should have the correct name property', () => {
    expect(source.name).toBe('local');
  });

  it('should return a random wallpaper and correct metadata', async () => {
    const folderPath = '/path/to/wallpapers';
    const mockFiles = ['img1.jpg', 'readme.txt', 'img2.png', 'document.pdf'];

    // --- Test Setup ---
    mockReaddir.mockResolvedValue(mockFiles);
    // --- End Setup ---

    // This will now use the mock and NOT throw ENOENT
    const wallpaper = await source.getWallpaper(folderPath);

    // Check that readdir was called correctly
    expect(mockReaddir).toHaveBeenCalledWith(folderPath);

    // Check that the output is correct
    expect(wallpaper).toEqual({
      id: '/path/to/wallpapers/img2.png',
      url: 'file:///path/to/wallpapers/img2.png',
      source: 'local',
      tags: ['wallpapers'],
    });
  });

  it('should correctly select the first image when random is 0', async () => {
    mathRandomSpy.mockReturnValue(0);

    const folderPath = '/path/to/pics';
    const mockFiles = ['first.png', 'second.jpg'];

    // --- Test Setup ---
    mockReaddir.mockResolvedValue(mockFiles);
    // --- End Setup ---

    const wallpaper = await source.getWallpaper(folderPath);

    expect(wallpaper.id).toBe('/path/to/pics/first.png');
  });

  // --- Error Handling ---

  it('should throw an error if no images are found', async () => {
    const folderPath = '/path/to/documents';
    const mockFiles = ['readme.txt', 'document.pdf', 'file.doc'];

    // --- Test Setup ---
    mockReaddir.mockResolvedValue(mockFiles);
    // --- End Setup ---

    // This will now get the correct error message
    await expect(source.getWallpaper(folderPath))
      .rejects
      .toThrow('No images found in: /path/to/documents');
  });

  it('should throw an error if the directory is empty', async () => {
    const folderPath = '/path/to/empty';
    const mockFiles: string[] = []; // Empty array

    // --- Test Setup ---
    mockReaddir.mockResolvedValue(mockFiles);
    // --- End Setup ---

    await expect(source.getWallpaper(folderPath))
      .rejects
      .toThrow('No images found in: /path/to/empty');
  });
});
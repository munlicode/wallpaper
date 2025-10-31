import {
  startWallpaperService,
  stopWallpaperService,
  restartWallpaperService,
} from './scheduler.js';
import { getAndSetWallpaper } from './index.js';
import { getAutoChangeInterval, getAutoChangeQuery } from './config.js';

// 1. Mock the dependencies
// We don't want to read actual config or change the wallpaper
jest.mock('./index.js', () => ({
  getAndSetWallpaper: jest.fn(),
}));

jest.mock('./config.js', () => ({
  getAutoChangeInterval: jest.fn(),
  getAutoChangeQuery: jest.fn(),
}));

// 2. Create typed mock variables for easier use
const mockGetAndSetWallpaper = getAndSetWallpaper as jest.Mock;
const mockGetAutoChangeInterval = getAutoChangeInterval as jest.Mock;
const mockGetAutoChangeQuery = getAutoChangeQuery as jest.Mock;

describe('Wallpaper Scheduler', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // 3. Use fake timers to control setInterval/clearInterval
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // 4. Reset all mocks and state before each test
  beforeEach(() => {
    jest.clearAllMocks(); // Resets mock call counts
    jest.clearAllTimers(); // Clears any pending intervals

    // Stop any running service to reset the module's internal state
    stopWallpaperService();

    // Spy on console messages to verify logs and suppress output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    // Default mock implementations
    mockGetAutoChangeQuery.mockReturnValue('default-query');
    mockGetAndSetWallpaper.mockResolvedValue(undefined);
  });

  // 5. Restore real timers and console after all tests
  afterAll(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('startWallpaperService', () => {
    it('should run immediately and set an interval', () => {
      mockGetAutoChangeInterval.mockReturnValue(15); // 15 minutes

      startWallpaperService();

      // Check for immediate run
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Scheduler: Starting service with 15 minute interval.',
      );
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1);
      expect(mockGetAndSetWallpaper).toHaveBeenCalledWith('default-query');

      // Check that the interval was set
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(
        expect.any(Function),
        15 * 60 * 1000, // 15 minutes in ms
      );

      // --- Simulate time passing ---
      mockGetAndSetWallpaper.mockClear(); // Clear call count from immediate run
      jest.advanceTimersByTime(15 * 60 * 1000); // Advance 15 minutes

      // Check that the interval callback ran
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1);

      // --- Simulate time passing again ---
      jest.advanceTimersByTime(15 * 60 * 1000); // Advance another 15 minutes
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(2);
    });

    it('should do nothing if the interval is 0', () => {
      mockGetAutoChangeInterval.mockReturnValue(0);
      startWallpaperService();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Scheduler: Auto-change is disabled.',
      );
      expect(mockGetAndSetWallpaper).not.toHaveBeenCalled();
      expect(setInterval).not.toHaveBeenCalled();
    });

    it('should do nothing if the interval is negative', () => {
      mockGetAutoChangeInterval.mockReturnValue(-10);
      startWallpaperService();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Scheduler: Auto-change is disabled.',
      );
      expect(mockGetAndSetWallpaper).not.toHaveBeenCalled();
      expect(setInterval).not.toHaveBeenCalled();
    });

    it('should log an error if the immediate run fails but still set the interval', () => {
      const testError = new Error('Failed to fetch');
      mockGetAndSetWallpaper.mockRejectedValue(testError);
      mockGetAutoChangeInterval.mockReturnValue(30);

      startWallpaperService();

      // Check that the immediate run was attempted and failed
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Scheduler: Error during auto-change:',
        testError,
      );

      // Check that the interval was still set
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(
        expect.any(Function),
        30 * 60 * 1000,
      );

      // Check that the interval still runs later
      mockGetAndSetWallpaper.mockResolvedValue(undefined); // Fix the error for the next run
      jest.advanceTimersByTime(30 * 60 * 1000);
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(2); // 1 initial fail + 1 successful interval
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // No new errors
    });
  });

  describe('stopWallpaperService', () => {
    it('should clear the interval if the service is running', () => {
      mockGetAutoChangeInterval.mockReturnValue(10);
      startWallpaperService();

      // Service is running
      expect(setInterval).toHaveBeenCalledTimes(1);
      mockGetAndSetWallpaper.mockClear();

      stopWallpaperService();

      // Check that stop worked
      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Scheduler: Service stopped.');

      // Advance time to see if the interval runs
      jest.advanceTimersByTime(10 * 60 * 1000);
      expect(mockGetAndSetWallpaper).not.toHaveBeenCalled();
    });

    it('should do nothing if the service is not running', () => {
      stopWallpaperService();

      // No log message, no clear
      expect(clearInterval).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith('Scheduler: Service stopped.');
    });
  });

  describe('restartWallpaperService', () => {
    it('should stop any running service and start a new one', () => {
      // 1. Start the first service
      mockGetAutoChangeInterval.mockReturnValue(10); // 10 min
      startWallpaperService();

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 10 * 60 * 1000);
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1); // Immediate run

      jest.clearAllMocks(); // Clear mocks before restarting

      // 2. Restart with a new interval
      mockGetAutoChangeInterval.mockReturnValue(30); // 30 min
      mockGetAutoChangeQuery.mockReturnValue('new-query');

      restartWallpaperService();

      // Check that stop was called
      expect(clearInterval).toHaveBeenCalledTimes(1);

      // Check that start was called
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Scheduler: Starting service with 30 minute interval.',
      );
      // Check for the *new* immediate run
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1);
      expect(mockGetAndSetWallpaper).toHaveBeenCalledWith('new-query');

      // Check that a *new* interval was set
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 30 * 60 * 1000);

      // 3. Verify old timer is gone and new one is active
      mockGetAndSetWallpaper.mockClear();

      jest.advanceTimersByTime(10 * 60 * 1000); // Advance by old interval
      expect(mockGetAndSetWallpaper).not.toHaveBeenCalled(); // Old timer didn't run

      jest.advanceTimersByTime(20 * 60 * 1000); // Advance to 30 min total
      expect(mockGetAndSetWallpaper).toHaveBeenCalledTimes(1); // New timer ran
    });
  });
});
import { jest } from '@jest/globals';

const mockAxiosGet = jest.fn();

jest.unstable_mockModule('axios', () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
  },
}));

let UnsplashSource: any;

// --- Test Suite ---

describe('UnsplashSource', () => {
  let source: any;

  // A mock API response to be reused
  const mockApiResponse = {
    data: {
      id: '12345',
      urls: { full: 'https://images.unsplash.com/full/12345' },
      user: { name: 'Mock Author' },
      tags: [{ title: 'nature' }, { title: 'forest' }],
    },
  };

  beforeEach(async () => {
    // 3. CRITICAL: Clear Jest's module cache.
    jest.resetModules();

    // 4. CRITICAL: Use jest.doMock.
    // This explicitly mocks 'axios' for the *next* import.
    jest.doMock('axios', () => ({
      // Mock the 'default' export
      default: {
        get: mockAxiosGet,
      },
      // Also mock the 'get' property on the root
      get: mockAxiosGet,
    }));

    // 5. Dynamically import the class *after* mocks are set up.
    // This will now load UnsplashSource with the *mocked* axios.
    const module = await import('./unsplash.js');
    UnsplashSource = module.UnsplashSource;

    // 6. Now we can create the instance
    source = new UnsplashSource();

    // 7. Mock the global API key.
    (global as any).UNSPLASH_API_KEY = 'mock_api_key';

    // 8. Clear the mock *after* setup, before the test runs.
    mockAxiosGet.mockClear();
  });

  afterEach(() => {
    // Clean up the global mock
    delete (global as any).UNSPLASH_API_KEY;
  });
  // --- Tests ---

  it('should have the correct name property', () => {
    expect(source.name).toBe('unsplash');
  });

  it('should fetch a wallpaper with a specific query', async () => {
    // Setup the mock
    mockAxiosGet.mockResolvedValue(mockApiResponse);

    const wallpaper = await source.getWallpaper('nature');

    // Check that axios.get was called with the correct URL and params
    expect(mockAxiosGet).toHaveBeenCalledWith('https://api.unsplash.com/photos/random', {
      params: {
        query: 'nature', // Should be the specific query
        client_id: 'mock_api_key',
      },
    });

    // Check that the data is transformed correctly
    expect(wallpaper).toEqual({
      id: '12345',
      urls: {
        full: "https://images.unsplash.com/full/12345",
        raw: undefined,
        regular: undefined,
        small: undefined
      },
      source: 'unsplash',
      author: 'Mock Author',
      tags: ['nature', 'forest'],
    });
  });

  it('should fetch a wallpaper with a "random" query', async () => {
    // Setup the mock
    mockAxiosGet.mockResolvedValue(mockApiResponse);

    const wallpaper = await source.getWallpaper('random');

    // Check that axios.get was called correctly
    expect(mockAxiosGet).toHaveBeenCalledWith('https://api.unsplash.com/photos/random', {
      params: {
        query: undefined, // Query should be undefined when input is 'random'
        client_id: 'mock_api_key',
      },
    });

    // Check that the output is still correct
    expect(wallpaper.id).toBe('12345');
  });

  it('should handle an empty tags array from the API', async () => {
    const mockResponseEmptyTags = {
      data: {
        ...mockApiResponse.data,
        tags: [], // Simulate an empty tags array
      },
    };
    mockAxiosGet.mockResolvedValue(mockResponseEmptyTags);

    const wallpaper = await source.getWallpaper('empty');

    expect(wallpaper.tags).toEqual([]);
  });

  it('should throw an error if the API call fails', async () => {
    const apiError = new Error('Network Error 500');
    // Setup the mock to reject with an error
    mockAxiosGet.mockRejectedValue(apiError);

    // We must await the rejection
    await expect(source.getWallpaper('error'))
      .rejects
      .toThrow('Network Error 500');
  });

  it('should throw a TypeError if the API response has null tags', async () => {
    const mockResponseNullTags = {
      data: {
        ...mockApiResponse.data,
        tags: null, // This will cause 'data.tags.map' to fail
      },
    };
    mockAxiosGet.mockResolvedValue(mockResponseNullTags);

    // Expect the promise to reject with a TypeError (or similar)
    await expect(source.getWallpaper('bad-data'))
      .rejects
      .toThrow("Cannot read properties of null (reading 'map')");
  });
});
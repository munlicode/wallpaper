import { useEffect, useState } from 'react';

type RandomMode = 'favorites' | 'history' | 'bookmarks' | 'all';

export const HomeView = () => {
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [query, setQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('black');
  const [randomMode, setRandomMode] = useState<RandomMode>('all'); // single choice

  const setStatus = (msg: string, color?: string) => {
    setStatusMessage(msg);
    if (color) setStatusColor(color);
  };

  useEffect(() => {
    (async () => {
      try {
        const [sourcesList, defaultSourceObj] = await Promise.all([
          window.wallpaperAPI.sources.list(),
          window.wallpaperAPI.config.get('defaultSource'),
        ]);
        setSources(sourcesList);

        const defaultSource = defaultSourceObj?.value;
        if (defaultSource && sourcesList.includes(defaultSource)) {
          setSelectedSource(defaultSource);
        } else if (sourcesList.length > 0) {
          setSelectedSource(sourcesList[0]);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setStatus(`❌ Failed to load sources: ${message}`, 'red');
      }
    })();
  }, []);

  const handleFetch = async () => {
    if (!selectedSource) {
      setStatus('⚠️ Please select a source first.', 'orange');
      return;
    }

    setStatus(
      query.trim()
        ? `🔍 Fetching "${query}" from ${selectedSource}...`
        : `🎨 Fetching wallpaper from ${selectedSource}...`,
      'blue'
    );

    try {
      await window.wallpaperAPI.fetchAndSet({
        source: selectedSource,
        query: query.trim() || '',
      });
      setStatus('✅ Wallpaper fetched successfully!', 'green');
      setQuery('');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus(`❌ Failed to fetch: ${message}`, 'red');
    }
  };

  const handleRandom = async () => {
    setStatus('🎲 Fetching random wallpaper...', 'blue');
    try {
      await window.wallpaperAPI.random.set({ [randomMode]: true });
      setStatus(`✅ Random wallpaper from ${randomMode} set successfully!`, 'green');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus(`❌ Failed to set random wallpaper: ${message}`, 'red');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🏠 Home</h2>

      {/* Source selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Source:</label>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
        >
          {sources.length === 0 ? (
            <option disabled>Loading...</option>
          ) : (
            sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Query input */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter search query (optional)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button onClick={handleFetch}>🔍 Fetch</button>
      </div>

      {/* Random wallpaper options */}
      <div style={{ marginBottom: '1rem' }}>
        <h4>Random Options:</h4>
        {(['favorites', 'history', 'bookmarks', 'all'] as RandomMode[]).map((mode) => (
          <label key={mode} style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              name="randomMode"
              checked={randomMode === mode}
              onChange={() => setRandomMode(mode)}
            />
            {mode}
          </label>
        ))}
      </div>

      {/* Random wallpaper */}
      <button onClick={handleRandom}>🎲 Random Wallpaper</button>

      {/* Status */}
      <p style={{ color: statusColor, marginTop: '1rem' }}>{statusMessage}</p>
    </div>
  );
};

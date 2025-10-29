declare global {
  interface Window {
    api: {
      getFavorites: () => Promise<any[]>; //TODO: Define the types
      getHistory: () => Promise<any[]>;
    };
  }
}

document.getElementById('test-button')?.addEventListener('click', async () => {
  console.log('Button clicked! Asking main process for favorites...');

  // Now we can securely call our backend function!
  const favorites = await window.api.getFavorites();

  const outputEl = document.getElementById('output');
  if (outputEl) {
    outputEl.textContent = JSON.stringify(favorites, null, 2);
  }
});

console.log('Renderer process loaded.');
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: [
          'sharp',
          'electron',
          'path',
          'fs',
        ],
        input: 'src/main/index.ts',
        output: {
          format: 'cjs',
          entryFileNames: 'index.js',
        },
      },
    },
  },

  preload: {
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: 'src/preload/index.ts',
        output: {
          format: 'cjs',
          entryFileNames: 'index.js',
        },
      },
    },
  },

  renderer: {
    resolve: {
      alias: {
        '@munlicode/core': path.resolve(__dirname, '../core/src')
      }
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    plugins: [
      react()
    ],
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: 'src/renderer/index.html',
      },
    },
  },
});
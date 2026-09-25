import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: '../Files/lanyard-dist',
    emptyOutDir: true,
    lib: {
      entry: './src/main.jsx',
      name: 'LanyardBundle',
      fileName: () => 'lanyard.bundle.js',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return '[name][extname]';
        }
      }
    }
  }
});

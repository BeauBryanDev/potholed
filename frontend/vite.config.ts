import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Suppress warning for chunks larger than 500kb
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        /**
         * Manual Chunks Strategy:
         * Splits heavy third-party node_modules into separate cached files.
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map-engine';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-analytics';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-core';
            }
            // Everything else goes to a generic vendor chunk
            return 'vendor-utils';
          }
        }
      }
    }
  }
});
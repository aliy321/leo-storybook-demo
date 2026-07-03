import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@leo/button': path.resolve(__dirname, '../../packages/publish/button/Button.web.tsx'),
    },
  },
});

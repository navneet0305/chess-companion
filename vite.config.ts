import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base =
  process.env.VITE_BASE_PATH ||
  (repoName && !repoName.endsWith('.github.io') ? `/${repoName}/` : '/');

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: false,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    open: false,
    allowedHosts: true,
  },
});

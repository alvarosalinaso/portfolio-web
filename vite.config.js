import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets loading for correct deployment on subfolders like GitHub Pages
});

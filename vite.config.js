import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Căi relative, ca build-ul să meargă și sub file:// în versiunea .exe
  base: './',
  build: {
    // Editorul folosește await la nivel de modul (încarcă datele înainte de orice)
    target: 'es2022',
    // „assets/” e rezervat pentru imaginile autorului, deci codul compilat stă în alt folder
    assetsDir: 'build',
    rollupOptions: {
      input: {
        joc: resolve(import.meta.dirname, 'index.html'),
        editor: resolve(import.meta.dirname, 'editor.html'),
      },
    },
  },
});

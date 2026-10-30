import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// import.meta.dirname nu există pe Node 18 (cel din Ubuntu 24.04)
const radacina = fileURLToPath(new URL('.', import.meta.url));

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
        joc: resolve(radacina, 'index.html'),
        editor: resolve(radacina, 'editor.html'),
      },
    },
  },
});

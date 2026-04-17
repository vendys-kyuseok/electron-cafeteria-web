import { defineConfig } from 'vite';
import path from 'node:path';
import url from 'node:url';

import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import electron from 'vite-plugin-electron/simple';
import svgr from 'vite-plugin-svgr';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    // svgr({
    //   svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
    //   include: '**/*.svg'
    // }),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts')
      }
    })
  ],
  server: {
    port: 5000
  }
});

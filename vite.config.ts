import { defineConfig } from 'vite';
// import { reactRouter } from '@react-router/dev/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// import react from '@vitejs/plugin-rea
// import { cloudflare } from "@cloudflare/vite-plugin";

// export default defineConfig({
//   plugins: [react(), cloudflare()],
// });

export default defineConfig({
  plugins: [
    cloudflare(),
    tailwindcss(),
    // react(),
    // reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@/*': './src/web/*',
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kissan_connect/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['lucide-react', 'react', 'react-dom', '@supabase/supabase-js'],
  },
});

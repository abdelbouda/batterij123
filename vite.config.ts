import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Splits zware vendor-libs uit de pagina-chunks zodat ze afzonderlijk
      // cachen en niet bij elke route-update ge-invalideerd worden.
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            motion: ['motion', 'motion/react'],
            icons: ['lucide-react'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            stripe: ['@stripe/stripe-js'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

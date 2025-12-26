import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      react()
      // ❌ 彻底删除了 broken 的 prerender 插件
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('highlight.js') || id.includes('leaflet')) return 'vendor-ui';
              return 'vendor';
            }
          }
        }
      }
    },
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        API_KEY: JSON.stringify(env.GEMINI_API_KEY),
        GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY)
      },
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(
        process.env.VERCEL_GIT_COMMIT_SHA || 'Dev-Mode'
      )
    }
  };
});

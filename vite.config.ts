import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// 引入预渲染插件和渲染器
import prerender from 'vite-plugin-prerender';
import Renderer from '@prerenderer/renderer-puppeteer';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 1. 基础路径配置
    base: '/',

    // 2. 开发服务器配置 (仅本地有效)
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

    // 3. 路径别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },

    // 4. 插件配置
    plugins: [
      react(),
      // 预渲染插件配置
      prerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: ['/', '/blogs', '/404'], // 需要预渲染的路由

        // 实例化 Puppeteer 渲染器
        renderer: new Renderer({
          maxConcurrentRoutes: 1,
          renderAfterTime: 500, // 等待 500ms 确保页面 JS 执行完毕
          headless: true
        }),

        // 压缩生成的 HTML
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          sortAttributes: true
        }
      })
    ],

    // 5. 构建配置
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // React 核心拆分
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              // UI 库拆分
              if (id.includes('highlight.js') || id.includes('leaflet')) {
                return 'vendor-ui';
              }
              // 其他第三方库
              return 'vendor';
            }
          }
        }
      }
    },

    // 6. 环境变量注入
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

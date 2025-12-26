import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import process from 'process';

// 模拟 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

// 🔥 配置并发数：Vercel 免费版建议设置 3-5，本地性能好可以设 10
const CONCURRENCY_LIMIT = 5;

// 1. 静态页面
const STATIC_ROUTES = ['/', '/blogs', '/profile', '/footprints', '/404'];

// 2. API 地址
const API_BASE_URL =
  process.env.VITE_API_URL || 'https://bananaboom-api-242273127238.asia-east1.run.app/api';

const isVercel = process.env.VERCEL === '1';

// --- Slug 处理 (保持与前端一致) ---
function slugify(text) {
  if (!text) return 'post';
  return (
    text
      .toString()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'post'
  );
}

// --- 启动预览服务器 ---
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting preview server...');
    const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
      stdio: 'inherit',
      shell: true,
      detached: false
    });
    // 给它一点时间启动
    setTimeout(() => {
      resolve(server);
    }, 3000);
  });
}

// --- 获取动态路由 ---
async function fetchPostRoutes() {
  console.log(`🌍 Fetching posts from API: ${API_BASE_URL}...`);
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error(`API responded with ${response.status}`);
    const posts = await response.json();

    const routes = posts.map((post) => {
      const id = post._id || post.id;
      const rawTitle = post.name || post.title || '';
      const cleanTitle = slugify(rawTitle);
      return `/blogs/${cleanTitle}-${id}`;
    });

    console.log(`📚 Found ${routes.length} posts to prerender.`);
    return routes;
  } catch (error) {
    console.error('⚠️ Failed to fetch posts:', error.message);
    return [];
  }
}

// --- 🔥 单个页面处理任务 ---
async function snapPage(browser, route, index, total) {
  let page = null;
  try {
    page = await browser.newPage();
    // 禁用不必要的资源请求以加速 (比如图片、字体、CSS)
    // 注意：如果你的页面严重依赖 CSS/JS 布局来决定内容显示，这里要谨慎
    // 这里为了 SEO 内容，图片拦截是安全的，CSS 最好还是加载
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'font', 'stylesheet'].includes(resourceType)) {
        // 如果你希望渲染结果带样式（避免闪烁），请注释掉 'stylesheet'
        // req.abort();
        req.continue();
      } else {
        req.continue();
      }
    });

    await page.setViewport({ width: 1280, height: 800 });

    const url = `http://localhost:4173${encodeURI(route)}`;

    // 稍微放宽超时时间，并发时可能会慢
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    if (route.includes('/blogs/') || route === '/profile') {
      try {
        await page.waitForSelector('main', { timeout: 5000 });
      } catch (e) {
        /* empty */
      }
    }

    const html = await page.content();

    let filePath;
    if (route === '/404') {
      filePath = path.join(DIST_DIR, '404.html');
    } else {
      const decodedRoute = decodeURIComponent(route);
      const routePath = decodedRoute.startsWith('/') ? decodedRoute.slice(1) : decodedRoute;
      const dir = path.join(DIST_DIR, routePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      filePath = path.join(dir, 'index.html');
    }

    fs.writeFileSync(filePath, html);
    console.log(`✅ [${index + 1}/${total}] Saved: ${decodeURIComponent(route)}`);
  } catch (e) {
    console.error(`❌ [${index + 1}/${total}] Error: ${route} - ${e.message}`);
  } finally {
    if (page) await page.close(); // 必须关闭页面以释放内存
  }
}

// --- 主流程 ---
(async () => {
  let serverProcess;
  let browser;

  try {
    const [_, dynamicRoutes] = await Promise.all([startServer(), fetchPostRoutes()]);

    const ALL_ROUTES = [...STATIC_ROUTES, ...dynamicRoutes];
    const total = ALL_ROUTES.length;

    console.log(`🎯 Total pages to snap: ${total} | Concurrency: ${CONCURRENCY_LIMIT}`);

    // 启动浏览器
    let executablePath;
    let launchArgs = [];
    if (isVercel) {
      console.log('☁️ Detected Vercel. Loading @sparticuz/chromium...');
      const chromium = await import('@sparticuz/chromium').then((m) => m.default);
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
    } else {
      console.log('💻 Local run. Using Puppeteer...');
      executablePath = puppeteer.executablePath();
      launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [...launchArgs, '--single-process', '--no-zygote']
    });

    // 🔥🔥🔥 核心并发控制逻辑 🔥🔥🔥
    // 维护一个正在执行的 Promise 列表
    const executing = [];
    const results = [];

    for (let i = 0; i < total; i++) {
      const route = ALL_ROUTES[i];

      // 创建一个 Promise 任务
      const p = snapPage(browser, route, i, total);
      results.push(p);

      // 如果任务数量小于并发限制，直接继续往里塞
      if (CONCURRENCY_LIMIT <= total) {
        // 包装 Promise：当它完成时，把自己从 executing 数组里移除
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);

        // 如果达到并发限制，就等待任意一个任务完成
        if (executing.length >= CONCURRENCY_LIMIT) {
          await Promise.race(executing);
        }
      }
    }

    // 等待所有剩余任务完成
    await Promise.all(results);

    console.log('🎉 All pages prerendered successfully!');
  } catch (error) {
    console.error('⚠️ Prerender script global error:', error);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) {
      console.log('🛑 Killing preview server...');
      serverProcess.kill();
    }
    process.exit(0);
  }
})();

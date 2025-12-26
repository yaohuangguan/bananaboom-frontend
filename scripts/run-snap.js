import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import process from 'process';

// 模拟 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

// 需要预渲染的路由
const ROUTES = ['/', '/blogs', '/profile', '/404'];

const isVercel = process.env.VERCEL === '1';

// 启动预览服务器
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting preview server...');
    // 使用 vite preview 启动 dist 目录
    const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
      stdio: 'inherit',
      shell: true,
      detached: false // 确保父进程死掉时子进程也死掉
    });

    // 简单粗暴：等待 3 秒让服务器启动（或者你可以轮询端口）
    setTimeout(() => {
      resolve(server);
    }, 3000);
  });
}

(async () => {
  let serverProcess;
  let browser;

  try {
    // 1. 启动本地静态服务器
    serverProcess = await startServer();

    // 2. 准备浏览器
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

    // 3. 开始抓取
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // 注意：Vite Preview 默认端口 4173
      const url = `http://localhost:4173${route === '/' ? '' : route}`;
      console.log(`📸 Snapping: ${url}`);

      try {
        // networkidle0: 等待网络空闲，确保 React 渲染完成
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // 额外的保险：等待 root 节点出现
        try {
          await page.waitForSelector('#root', { timeout: 5000 });
        } catch (e) {
          /* empty */
        }

        const html = await page.content();

        // 计算文件路径
        // / -> index.html
        // /blogs -> /blogs/index.html
        // /404 -> 404.html
        let filePath;
        if (route === '/404') {
          filePath = path.join(DIST_DIR, '404.html');
        } else {
          const routePath = route === '/' ? '' : route;
          const dir = path.join(DIST_DIR, routePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          filePath = path.join(dir, 'index.html');
        }

        fs.writeFileSync(filePath, html);
        console.log(`✅ Saved: ${filePath}`);
      } catch (e) {
        console.error(`❌ Error snapping ${route}:`, e.message);
        // 不中断部署，只报错
      } finally {
        await page.close();
      }
    }
  } catch (error) {
    console.error('⚠️ Prerender script failed:', error);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) {
      console.log('🛑 Killing preview server...');
      serverProcess.kill();
    }
    // 强制成功退出，保证 Vercel 部署不挂
    process.exit(0);
  }
})();

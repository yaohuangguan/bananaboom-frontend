import { run } from 'react-snap';
import puppeteer from 'puppeteer'; // 本地开发用
import path from 'path';
import fs from 'fs';
import process from 'process';

// 判断是否在 Vercel 环境
const isVercel = process.env.VERCEL === '1';

(async () => {
  try {
    let executablePath;
    let launchArgs = [];

    if (isVercel) {
      console.log('☁️ Detected Vercel Environment. Loading @sparticuz/chromium...');

      // 动态导入，防止本地开发报错
      const chromium = await import('@sparticuz/chromium').then((m) => m.default);

      // Vercel 必须用这个专用图形库，它解决了 libnspr4.so 缺失的问题
      // 这里的 executablePath() 会解压出一个能在极简 Linux 上跑的浏览器
      executablePath = await chromium.executablePath();

      // Vercel 推荐的参数
      launchArgs = chromium.args;
    } else {
      console.log('💻 Detected Local Environment. Using Standard Puppeteer...');

      // 本地逻辑保持不变
      executablePath = puppeteer.executablePath();
      executablePath = path.resolve(executablePath);

      // Windows 修复
      if (process.platform === 'win32') {
        executablePath = executablePath.split(path.sep).join('/');
      }

      // 本地参数
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ];
    }

    console.log(`🚀 Final Executable Path: ${executablePath}`);

    // 双重检查 (Vercel 上 sparticuz 会自动处理路径，通常不需要 fs.check，但保留无妨)
    if (!isVercel && !fs.existsSync(executablePath)) {
      throw new Error(`Chrome executable missing at ${executablePath}`);
    }

    // 运行 react-snap
    await run({
      puppeteerExecutablePath: executablePath,
      source: 'dist',
      destination: 'dist',
      include: ['/', '/blogs'],

      // 合并参数
      puppeteerArgs: [
        ...launchArgs,
        '--single-process', // Vercel 必须单进程
        '--no-zygote'
      ],

      // Vercel 这种解压版启动很慢，必须加长超时时间
      pageLoadTimeout: 120000,
      // 甚至可以增加延迟，等待 JS 执行
      minifyCss: true,
      inlineCss: true
    });

    console.log('✅ Pre-rendering complete!');
  } catch (error) {
    console.error('⚠️ Pre-rendering failed, but continuing build...', error);
    // 依然保持 exit 0，先让你的网站上线再说
    process.exit(0);
  }
})();

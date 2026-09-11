#!/usr/bin/env node
/* screenshot-safe-area.mjs
 * 模拟 iOS PWA standalone 模式下 safe-area-inset 的真实值，截图 5 个 tab 页。
 *
 * 手段：Playwright 无法真正触发 env(safe-area-inset-*)（那是操作系统层给
 * WKWebView 的），所以我们注入一个 <style> 覆盖 --safe-top / --safe-bottom
 * CSS 变量（app.css 里 tab-bar / page-outlet 都是通过这两个变量读 safe area）。
 *
 * iPhone 13/14（notch）：safe-top=47px, safe-bottom=34px
 * iPhone 15 Pro（Dynamic Island）：safe-top=59px, safe-bottom=34px
 * 我们用 47/34 一档 + 59/34 另一档，都截。
 *
 * 输出：evidence/safe-area/<preset>/<page>.png
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT_ROOT = join(ROOT, 'evidence', 'safe-area-after');

const PRESETS = [
  { name: 'iphone13-notch', top: 47, bottom: 34 },
  { name: 'iphone15pro-island', top: 59, bottom: 34 },
];

const PAGES = [
  { hash: '#home', file: '01-home.png' },
  { hash: '#vocab', file: '02-vocab.png' },
  { hash: '#conversation', file: '03-conversation.png' },
  { hash: '#grammar', file: '04-grammar.png' },
  { hash: '#profile', file: '05-profile.png' },
];

async function main() {
  if (existsSync(OUT_ROOT)) rmSync(OUT_ROOT, { recursive: true });
  mkdirSync(OUT_ROOT, { recursive: true });

  const server = spawn('python3', ['-m', 'http.server', '8765'], {
    cwd: ROOT, stdio: 'pipe',
  });
  await sleep(600);

  try {
    const browser = await chromium.launch();

    for (const preset of PRESETS) {
      const presetDir = join(OUT_ROOT, preset.name);
      mkdirSync(presetDir, { recursive: true });

      const injectCss = `
        :root {
          --safe-top: ${preset.top}px !important;
          --safe-bottom: ${preset.bottom}px !important;
        }
      `;

      for (const page of PAGES) {
        // 用 iPhone 13 device profile（390×844 CSS px，@3x）
        const context = await browser.newContext({
          ...devices['iPhone 13'],
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 2, // @2x 输出，保持文件大小
        });
        const p = await context.newPage();

        // 先访问一次注入 localStorage 绕过评估门槛
        await p.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' });
        await p.evaluate(() => {
          localStorage.setItem('lt_assessment_v1', JSON.stringify({
            level: 'B1',
            completedAt: Date.now(),
            answers: {},
            strengths: ['听力理解稳定'],
            weaknesses: ['时态使用'],
          }));
        });
        await p.goto(`http://localhost:8765/#${page.hash.slice(1)}`, { waitUntil: 'networkidle' });
        // 注入模拟 safe-area 的 CSS
        await p.addStyleTag({ content: injectCss });
        // 等一帧
        await sleep(400);

        const out = join(presetDir, page.file);
        await p.screenshot({ path: out, fullPage: false });
        console.log('saved', out);
        await context.close();
      }
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

import { chromium, devices } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = decodeURIComponent(new URL('../../', import.meta.url).pathname);

function serve(root, port) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/' || p.endsWith('/')) p += 'index.html';
      const fp = path.join(root, p);
      if (!fp.startsWith(root) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
        // SPA fallback
        res.end(fs.readFileSync(path.join(root, 'index.html')));
        return;
      }
      const ext = path.extname(fp);
      const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
                     '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
                     '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' }[ext] || 'text/plain';
      res.setHeader('content-type', mime);
      res.end(fs.readFileSync(fp));
    });
    srv.listen(port, () => resolve(srv));
  });
}

const OUT = decodeURIComponent(new URL('.', import.meta.url).pathname);
fs.mkdirSync(OUT, { recursive: true });

const srv = await serve(ROOT, 8765);
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  hasTouch: true,
});
const page = await ctx.newPage();

// 1) 对话入口页
await page.goto('http://127.0.0.1:8765/#conversation', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, '01-entry.png') });

// 2) 进入自由对话
await page.evaluate(() => {
  location.hash = '#conversation/chat/free';
});
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '02-chat-empty.png') });

// 3) 模拟录音中（直接触发 UI 状态，不走真实 mic）
await page.evaluate(() => {
  const overlay = document.querySelector('#conv-recording-overlay');
  const mic = document.querySelector('#conv-mic');
  if (overlay) overlay.hidden = false;
  if (mic) mic.classList.add('recording');
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, '03-recording.png') });

// 4) 模拟"待发送"态：填文字 + 徽章
await page.evaluate(() => {
  const overlay = document.querySelector('#conv-recording-overlay');
  const mic = document.querySelector('#conv-mic');
  const input = document.querySelector('#conv-input');
  const composer = document.querySelector('#conv-composer');
  const badge = document.querySelector('#conv-pending-badge');
  const send = document.querySelector('#conv-send');
  if (overlay) overlay.hidden = true;
  if (mic) mic.classList.remove('recording');
  if (input) input.value = 'I would like to order a coffee, please.';
  if (composer) composer.classList.add('has-pending');
  if (badge) badge.hidden = false;
  if (send) send.disabled = false;
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, '04-pending.png') });

// 5) 复现赤拔的场景：录音 + 待发送同时存在（bug 状态）
await page.evaluate(() => {
  const overlay = document.querySelector('#conv-recording-overlay');
  const mic = document.querySelector('#conv-mic');
  const badge = document.querySelector('#conv-pending-badge');
  if (overlay) overlay.hidden = false;
  if (mic) mic.classList.add('recording');
  if (badge) badge.hidden = false;
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, '05-both-visible.png') });

await browser.close();
srv.close();
console.log('done');

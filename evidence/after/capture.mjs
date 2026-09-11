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

const srv = await serve(ROOT, 8766);
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  hasTouch: true,
});
// 拦截 SW 避免缓存旧 CSS
await ctx.route('**/sw.js', (route) => route.fulfill({ status: 404, body: '' }));

// mock speech api
await ctx.addInitScript(() => {
  window.__mock = { spokenTexts: [] };
  class MockRec {
    start() {}
    stop() {
      const self = this;
      setTimeout(() => {
        if (self.onresult) self.onresult({ results: [[{ transcript: 'I would like to order a coffee, please.' }]] });
        if (self.onend) self.onend();
      }, 20);
    }
  }
  window.SpeechRecognition = MockRec;
  window.webkitSpeechRecognition = MockRec;
  class Utter { constructor(t) { this.text = t; } }
  window.SpeechSynthesisUtterance = Utter;
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speaking: false,
      cancel() { this.speaking = false; },
      speak(u) {
        window.__mock.spokenTexts.push(u.text);
        if (u.onstart) u.onstart();
        setTimeout(() => { if (u.onend) u.onend(); }, 20);
      }
    },
    writable: true, configurable: true
  });
});

const page = await ctx.newPage();

// 清 SW + caches
await page.goto('http://127.0.0.1:8766/');
await page.evaluate(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
});

// 进入自由对话
await page.goto('http://127.0.0.1:8766/#conversation/chat/free');
await page.waitForSelector('#conv-messages', { timeout: 5000 });
await page.waitForSelector('.msg-row.tutor', { timeout: 5000 });
await page.waitForTimeout(400);

// 1) 空状态（idle）——校验 P2 状态栏让开
await page.screenshot({ path: path.join(OUT, '01-idle.png') });

// 2) 录音中（recording）
await page.dispatchEvent('#conv-mic', 'mousedown');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, '02-recording.png') });

// 3) 待发送（pending）
await page.dispatchEvent('#conv-mic', 'mouseup');
await page.waitForFunction(() => {
  var c = document.querySelector('#conv-composer');
  return c && c.classList.contains('is-pending');
}, null, { timeout: 3000 });
await page.waitForFunction(() => {
  var el = document.querySelector('#conv-composer.is-pending .conv-input-wrap');
  if (!el) return false;
  return /^rgb.*\(1(7[5-9]),\s*58,\s*40/.test(getComputedStyle(el).borderTopColor);
}, null, { timeout: 3000 });
await page.screenshot({ path: path.join(OUT, '03-pending.png') });

// 4) 点输入框 = 进入编辑，pending 移除
await page.click('#conv-input');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(OUT, '04-editing.png') });

// 5) 手动打字（模拟用户在 pending 后清空重新输入）
await page.focus('#conv-input');
await page.fill('#conv-input', 'How are you today?');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(OUT, '05-typed.png') });

await browser.close();
srv.close();
console.log('done');

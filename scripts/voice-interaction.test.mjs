/* voice-interaction.test.mjs
 * Playwright headless 验收测试 —— 对话模块语音交互（TTS + STT + 发送确认）
 * 覆盖任务 t_d92fbecf 的 5 条验收标准。
 *
 * 由于真实浏览器沙箱下 Web Speech API 需要用户授权/网络，此处对
 * window.SpeechRecognition / window.speechSynthesis 做确定性 mock，
 * 但完全复用页面自身的 js/speech.js + js/conversation.js 逻辑 ——
 * 不 mock 业务代码本身，只 mock 浏览器提供的语音接口。
 *
 * 用法：node scripts/run-playwright-tests.mjs（由 package.json "test" 调用）
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent(req.url.split('?')[0]);
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = join(ROOT, urlPath);
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch (e) {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// 注入 Web Speech API mock —— 在页面任何脚本执行前生效（addInitScript）
const MOCK_SPEECH_INIT = () => {
  window.__mock = { spokenTexts: [], recognitionInstances: [] };

  class MockSpeechRecognition {
    constructor() {
      this.lang = '';
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.continuous = false;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      window.__mock.recognitionInstances.push(this);
    }
    start() {
      window.__mock.activeRecognition = this;
    }
    stop() {
      // 由测试代码通过 window.__mock.resolveRecognition() 主动触发结果，
      // 这里模拟真实浏览器：stop() 后异步触发 onresult + onend。
      const self = this;
      setTimeout(function () {
        var text = window.__mock.nextSTTResult || '';
        if (self.onresult) {
          self.onresult({ results: [[{ transcript: text }]] });
        }
        if (self.onend) self.onend();
      }, 20);
    }
  }
  window.SpeechRecognition = MockSpeechRecognition;
  window.webkitSpeechRecognition = MockSpeechRecognition;

  class MockUtterance {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  }
  window.SpeechSynthesisUtterance = MockUtterance;

  var mockSynth = {
    speaking: false,
    cancel: function () { this.speaking = false; },
    speak: function (utter) {
      window.__mock.spokenTexts.push(utter.text);
      this.speaking = true;
      var self = this;
      if (utter.onstart) utter.onstart();
      setTimeout(function () {
        self.speaking = false;
        if (utter.onend) utter.onend();
      }, 30);
    }
  };
  // window.speechSynthesis 在真实浏览器里是只读的 accessor property，
  // 直接赋值会被 Chromium 静默忽略（不抛错，但也不生效）——必须用
  // defineProperty 强制覆盖，业务代码 speech.js 顶部缓存的
  // `var synth = window.speechSynthesis;` 才会拿到 mock 实例。
  Object.defineProperty(window, 'speechSynthesis', {
    value: mockSynth,
    writable: true,
    configurable: true
  });
};

const results = [];
function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail: detail || '' });
  console.log((cond ? 'PASS' : 'FAIL') + ' — ' + name + (detail ? '  (' + detail + ')' : ''));
}

async function main() {
  const server = await startServer();
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  // 关键：拦截 SW 注册——否则第二次 goto 后 SW 缓存了旧 app.css/JS，样式改动看不到
  await context.route('**/sw.js', (route) => route.fulfill({ status: 404, body: '' }));
  const page = await context.newPage();
  await page.addInitScript(MOCK_SPEECH_INIT);
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

  // 保险起见：卸载已存在的 SW 注册 + 清 caches
  await page.goto(base + '/');
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

  await page.goto(base + '/#conversation/chat/free');
  await page.waitForSelector('#conv-messages', { timeout: 5000 });
  // 等第一轮 AI opener 渲染 + 自动朗读触发
  await page.waitForSelector('.msg-row.tutor', { timeout: 5000 });
  await page.waitForTimeout(150);

  // ---- 验收标准 1（一半）：AI 回复自动朗读英文 ----
  const spokenAfterOpener = await page.evaluate(() => window.__mock.spokenTexts.length);
  check('AI 开场白自动朗读（TTS autoplay）', spokenAfterOpener >= 1,
    'spokenTexts=' + JSON.stringify(await page.evaluate(() => window.__mock.spokenTexts)));

  // ---- 验收标准 2：所有可点击区域 ≥ 44×44pt ----
  const tapTargets = await page.evaluate(() => {
    var sels = ['#conv-mic', '#conv-send', '.msg-speak-btn'];
    var out = [];
    sels.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var r = el.getBoundingClientRect();
        out.push({ sel: sel, w: r.width, h: r.height });
      });
    });
    return out;
  });
  const tooSmall = tapTargets.filter((t) => t.w < 44 || t.h < 44);
  check('所有语音相关可点击区域 ≥ 44×44pt', tapTargets.length > 0 && tooSmall.length === 0,
    JSON.stringify(tapTargets) + (tooSmall.length ? ' TOO_SMALL=' + JSON.stringify(tooSmall) : ''));

  // ---- 验收标准 3：录音状态（composer.is-recording）有波形 + 计时可见反馈 · t_c3407922 定稿 B ----
  await page.evaluate(() => { window.__mock.nextSTTResult = 'I has a apple'; });
  const composerRecBefore = await page.$eval('#conv-composer', (el) => el.classList.contains('is-recording'));
  await page.dispatchEvent('#conv-mic', 'mousedown');
  await page.waitForTimeout(50);
  const composerRecDuring = await page.$eval('#conv-composer', (el) => el.classList.contains('is-recording'));
  const waveformVisible = await page.$eval('.rec-waveform', (el) => {
    var s = getComputedStyle(el);
    return s.display !== 'none' && el.getBoundingClientRect().width > 0;
  });
  // 关键：录音态下 input 与 mic/send 按钮必须完全不可见（B 案零重叠）
  const inputHiddenDuringRec = await page.$eval('#conv-input', (el) => getComputedStyle(el).display === 'none');
  const micHiddenDuringRec = await page.$eval('#conv-mic', (el) => getComputedStyle(el).display === 'none');
  const sendHiddenDuringRec = await page.$eval('#conv-send', (el) => getComputedStyle(el).display === 'none');
  await page.waitForTimeout(300); // 让计时器至少走一格
  const timerText = await page.$eval('#conv-rec-timer', (el) => el.textContent);
  await page.dispatchEvent('#conv-mic', 'mouseup');
  await page.waitForTimeout(200);  // 之前 80ms 可能不够，MockRecognition setTimeout 20ms + rAF
  await page.waitForFunction(() => document.querySelector('#conv-composer').classList.contains('is-pending'), null, { timeout: 2000 });
  const composerRecAfter = await page.$eval('#conv-composer', (el) => el.classList.contains('is-recording'));
  check('录音开始前 composer 无 is-recording', composerRecBefore === false);
  check('录音中 composer.is-recording + 波形可见', composerRecDuring && waveformVisible);
  check('录音中 input/麦克风/发送按钮全部让位（零重叠）',
    inputHiddenDuringRec && micHiddenDuringRec && sendHiddenDuringRec,
    'input=' + inputHiddenDuringRec + ' mic=' + micHiddenDuringRec + ' send=' + sendHiddenDuringRec);
  check('录音计时器有输出', /^\d+:\d{2}$/.test(timerText), 'timerText=' + timerText);
  check('录音结束后 composer.is-recording 移除', composerRecAfter === false);

  // ---- 验收标准 4：STT 结果填入输入框后不自动发送，需用户点发送 ----
  const inputValueAfterSTT = await page.$eval('#conv-input', (el) => el.value);
  const userMsgCountAfterSTT = await page.$$eval('.msg-row.user', (els) => els.length);
  // 定稿 B：pending 由 composer.is-pending 承载，input 边框变红 + 内嵌 dot 可见 + 发送按钮变红
  // 等 pending 类稳定 attach（onEnd/onResult 竞态可能先 idle 后 pending）
  await page.waitForFunction(() => {
    var c = document.querySelector('#conv-composer');
    return c && c.classList.contains('is-pending');
  }, null, { timeout: 3000 });
  const isPending = await page.$eval('#conv-composer', (el) => el.classList.contains('is-pending'));
  const pendingDotVisible = await page.$eval('.pending-dot', (el) => getComputedStyle(el).display !== 'none');
  // 等 pending style propagate 到 border（Chromium getComputedStyle 有时序缓存）
  const inputWrapBorder = await page.waitForFunction(() => {
    var el = document.querySelector('#conv-composer.is-pending .conv-input-wrap');
    if (!el) return null;
    var cs = getComputedStyle(el);
    // 只有当 border-top-color 是 primary（rgb(178,58,40)）时才 return
    if (!/^rgb.*\(1(7[5-9]),\s*58,\s*40/.test(cs.borderTopColor)) return null;
    return cs.borderTopColor;
  }, null, { timeout: 3000 }).then((h) => h.jsonValue());
  const sendBtnEnabled = await page.$eval('#conv-send', (el) => !el.disabled);
  check('语音识别结果已填入输入框', inputValueAfterSTT === 'I has a apple', 'value=' + inputValueAfterSTT);
  check('填入后未自动发送（用户消息数仍为 0）', userMsgCountAfterSTT === 0, 'count=' + userMsgCountAfterSTT);
  check('composer 进入 is-pending 态（B 案：无独立徽章，靠 composer class）', isPending);
  check('pending-dot 可见（输入框内脉冲红点）', pendingDotVisible);
  check('input 边框变红（primary #B23A28 ~ rgb(178, 58, 40)）',
    /1(78|76|75|77),\s*58,\s*40/.test(inputWrapBorder), 'border=' + inputWrapBorder);
  check('发送按钮已启用（等待用户主动点击）', sendBtnEnabled);

  await page.click('#conv-send');
  await page.waitForTimeout(150);
  const userMsgCountAfterClick = await page.$$eval('.msg-row.user', (els) => els.length);
  check('点击发送按钮后消息才真正发出', userMsgCountAfterClick === 1, 'count=' + userMsgCountAfterClick);

  // ---- 验收标准 5：AI 消息旁有重播按钮，点击可重新朗读 ----
  await page.waitForSelector('.msg-row.tutor:nth-of-type(1)', { timeout: 5000 });
  await page.waitForFunction(() => document.querySelectorAll('.msg-row.tutor').length >= 2, null, { timeout: 5000 });
  const speakButtons = await page.$$('.msg-speak-btn');
  check('每条 AI 消息旁存在朗读/重播按钮', speakButtons.length >= 2, 'count=' + speakButtons.length);

  const spokenBeforeReplay = await page.evaluate(() => window.__mock.spokenTexts.length);
  await speakButtons[0].click();
  let playingClassAdded = false;
  try {
    await page.waitForFunction(() => document.querySelectorAll('.msg-speak-btn.playing').length > 0, null, { timeout: 2000 });
    playingClassAdded = true;
  } catch (e) { /* stays false, reported as FAIL below */ }
  let playingClassRemoved = false;
  try {
    await page.waitForFunction(() => document.querySelectorAll('.msg-speak-btn.playing').length === 0, null, { timeout: 2000 });
    playingClassRemoved = true;
  } catch (e) { /* stays false, reported as FAIL below */ }
  const spokenAfterReplay = await page.evaluate(() => window.__mock.spokenTexts.length);
  check('点击重播按钮触发朗读（spokenTexts 增加）', spokenAfterReplay > spokenBeforeReplay);
  check('朗读中按钮切到 playing 态', playingClassAdded);
  check('朗读结束后 playing 态移除', playingClassRemoved);

  await browser.close();
  server.close();

  const failed = results.filter((r) => !r.pass);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' passed.');
  if (failed.length) {
    console.log('FAILED:');
    failed.forEach((f) => console.log(' - ' + f.name + '  ' + f.detail));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('测试运行异常:', e);
  process.exit(1);
});

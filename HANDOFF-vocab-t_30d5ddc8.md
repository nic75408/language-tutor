# HANDOFF · 词库体验优化 · t_30d5ddc8

> **给老费**：本卡定稿方案 C（Segmented Control）+ Sticky Tab。以下是逐条可执行的实施规格，改动集中在 3 个文件（`app.css` / `js/vocab.js` / 无 index.html 改动）。DESIGN.md 已同步。

## 交付物清单

- `DESIGN.md` diff：新增 `sticky-tabs` / `segmented-control` / `segmented-control-selected` 三个 component tokens；badge-* 说明改为"纯语义标签"；Components 段新增两节；Decision Log 新增一条。
- `sketches/vocab-A-swipe/` / `vocab-B-checkbox/` / `vocab-C-segmented/` — 三案 HTML mockup + firstpaint/scrolled/tall PNG（md5 已两两不同校验）。
- `sketches/vocab-ADJUDICATION.md` — 三案自评（42/36/46，C 胜）+ 落选案留档理由。
- 本文件 `HANDOFF-vocab-t_30d5ddc8.md` — 老费实施规格。

---

## A. Sticky 场景 Tab 栏（问题 1）

### A.1 结构调整（HTML 层，`js/vocab.js` render 输出）

**当前结构**：

```
<div class="page">
  <h1 class="page-title">词库</h1>
  <div class="vocab-summary">...</div>
  <div class="vocab-scene-tabs">...</div>       ← 会随内容滚出
  <label class="vocab-due-toggle">...</label>
  <div class="vocab-list">...</div>
</div>
```

**目标结构**：

```
<div class="page">
  <h1 class="page-title">词库</h1>
  <div class="vocab-summary">...</div>
  <div class="vocab-sticky-tabs">              ← 新加一层容器：sticky top:0
    <div class="vocab-scene-tabs">...</div>
  </div>
  <label class="vocab-due-toggle">...</label>
  <div class="vocab-list">...</div>
</div>
```

只加一层 `.vocab-sticky-tabs` 包住原 `.vocab-scene-tabs`（旧类名保留、内层样式不动）。

### A.2 CSS 精确规格（追加到 `app.css` `.vocab-scene-tabs` 之前）

```css
/* Sticky 顶栏容器（DESIGN.md sticky-tabs · t_30d5ddc8） */
.vocab-sticky-tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 calc(var(--pad-page) * -1) 12px;   /* 出血到屏边 */
  padding: 8px var(--pad-page) 10px;
  background: rgba(247, 243, 236, 0.88);        /* paper α0.88 */
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--color-rule);
}

/* Fallback：旧 iOS Safari 不支持 backdrop-filter 时改用高不透明度纸底 */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .vocab-sticky-tabs {
    background: rgba(247, 243, 236, 0.98);
  }
}
```

**修订**：`.vocab-scene-tabs` 现有的 `margin-bottom: 10px` **移除**（`.vocab-sticky-tabs` 已负责 12px 底距）。

```css
.vocab-scene-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  /* margin-bottom: 10px;   ← 移除 */
  -webkit-overflow-scrolling: touch;
}
```

### A.3 验收（跑冒烟）

- 滚动到第 20 个词时（`el.scrollTop >= 800`），场景 Tab 栏仍固定在 `.page-outlet` 顶端，可直接点"旅行"切换到旅行场景。
- 毛玻璃底能透出下方内容轻微背景（在 iPhone 13+ 上）。
- 页面切到别的 tab 再回来，sticky 行为不残留（应该不残留，因为 `.page-outlet` 是每次 render 重新填 innerHTML）。

---

## B. 状态徽章去按钮化 + Segmented Control（问题 2）

### B.1 徽章：从 `<button>` 改为 `<span>`（`js/vocab.js` renderWordCard）

**当前**（`js/vocab.js` L215-217）：

```js
'<button class="vocab-status-badge status-' + entry.status + '" data-status-toggle="' + word.id + '">' +
  STATUS_LABEL[entry.status] +
'</button>'
```

**改为**：

```js
'<span class="vocab-status-tag status-' + entry.status + '" aria-label="状态：' + STATUS_LABEL[entry.status] + '">' +
  STATUS_LABEL[entry.status] +
'</span>'
```

### B.2 徽章 CSS（`app.css` 替换 `.vocab-status-badge` 三态）

**移除**：`.vocab-status-badge`、`.vocab-status-badge.status-new/learning/mastered` 现有规则（L580-605）。

**新增**：

```css
/* 状态标签（纯语义 · 不可点 · DESIGN.md badge-* · t_30d5ddc8） */
.vocab-status-tag {
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;                   /* rounded.xs */
  white-space: nowrap;
  /* 显式不是按钮：无 cursor pointer、无 border、无 button element */
}
.vocab-status-tag.status-new      { background: var(--color-primary-soft); color: var(--color-primary); }
.vocab-status-tag.status-learning { background: var(--color-warning-soft); color: var(--color-warning); }
.vocab-status-tag.status-mastered { background: var(--color-success-soft); color: var(--color-success); }
```

### B.3 移除三态循环切换逻辑（`js/vocab.js` bindEvents）

**移除**（L314-326）：`data-status-toggle` 分支 —— 徽章已不是 button，此分支永远不会触发；显式清理以避免歧义。

```js
// 删除这段：
var statusBtn = e.target.closest('[data-status-toggle]');
if (statusBtn) {
  e.stopPropagation();
  var sid = statusBtn.getAttribute('data-status-toggle');
  var progress = loadProgress();
  var w2 = (window.VOCAB_DATA || []).filter(function (w) { return w.id === sid; })[0];
  if (w2) {
    var entry = getEntryState(progress, w2);
    setStatus(w2, cycleStatus(entry.status));
  }
  render(container);
  return;
}
```

`cycleStatus()` 函数也可移除。

### B.4 展开区新增 Segmented Control（`js/vocab.js` renderWordCard 展开态）

**当前展开态**（L196-208）：

```js
detailHtml = '<div class="vocab-card-detail">' +
  '<div class="vocab-detail-row"><span class="vocab-detail-label">例句</span>' +
  '<p class="vocab-example">' + escapeHtml(word.example || '') + '</p></div>' +
  '<div class="vocab-review-actions">' +
    '<span class="vocab-detail-label">复习评价</span>' +
    '<div class="vocab-review-btns">' +
      '<button class="vocab-review-btn again" data-review="2" data-id="' + word.id + '">不认识</button>' +
      ...
    '</div></div>' +
'</div>';
```

**改为**（在"例句"和"复习评价"之间加"状态"段）：

```js
var statusSegHtml = '<div class="vocab-status-segmented">' +
  '<span class="vocab-detail-label">状态</span>' +
  '<div class="vocab-segmented" role="radiogroup" aria-label="学习状态">' +
    STATUS_ORDER.map(function (s) {
      var pressed = s === entry.status ? 'true' : 'false';
      return '<button class="seg-' + s + '" role="radio" aria-pressed="' + pressed + '" data-set-status="' + s + '" data-id="' + word.id + '">' +
        '<span class="seg-dot"></span>' + STATUS_LABEL[s] +
      '</button>';
    }).join('') +
  '</div>' +
'</div>';

detailHtml = '<div class="vocab-card-detail">' +
  '<div class="vocab-detail-row"><span class="vocab-detail-label">例句</span>' +
  '<p class="vocab-example">' + escapeHtml(word.example || '') + '</p></div>' +
  statusSegHtml +
  '<div class="vocab-review-actions">' +
    '<span class="vocab-detail-label">复习评价</span>' +
    '<div class="vocab-review-btns">' +
      '<button class="vocab-review-btn again" data-review="2" data-id="' + word.id + '">不认识</button>' +
      '<button class="vocab-review-btn hard" data-review="3" data-id="' + word.id + '">模糊</button>' +
      '<button class="vocab-review-btn good" data-review="4" data-id="' + word.id + '">认识</button>' +
      '<button class="vocab-review-btn easy" data-review="5" data-id="' + word.id + '">很熟</button>' +
    '</div>' +
  '</div>' +
'</div>';
```

### B.5 Segmented Control 事件（`js/vocab.js` bindEvents）

在 `listEl.addEventListener('click', ...)` 里 review 分支之后加：

```js
var segBtn = e.target.closest('[data-set-status]');
if (segBtn) {
  e.stopPropagation();
  var sid = segBtn.getAttribute('data-id');
  var newStatus = segBtn.getAttribute('data-set-status');
  var w = (window.VOCAB_DATA || []).filter(function (x) { return x.id === sid; })[0];
  if (w) setStatus(w, newStatus);
  render(container);
  return;
}
```

### B.6 Segmented Control CSS（`app.css` 追加到 `.vocab-review-actions` 之前）

```css
/* Segmented Control · 词卡状态切换（DESIGN.md segmented-control · t_30d5ddc8） */
.vocab-status-segmented {
  margin-top: 14px;
}
.vocab-status-segmented .vocab-detail-label {
  display: block;
  margin-bottom: 6px;
}
.vocab-segmented {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  background: var(--color-paper-alt);
  border-radius: var(--radius-sm);         /* 4px */
  padding: 3px;
  min-height: 44px;                        /* HIG · 容器整体 44 */
}
.vocab-segmented button {
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 13px;
  color: var(--color-ink-2);
  cursor: pointer;
  border-radius: 6px;
  padding: 8px 4px;
  min-height: 38px;                        /* 内段 38，容器满足 44 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.18s ease, color 0.18s ease;
}
.vocab-segmented .seg-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}
/* 语义色（未选中时点用语义色，文字保持 ink-2 · 提示"这是什么态"） */
.vocab-segmented button.seg-new .seg-dot      { color: var(--color-primary); }
.vocab-segmented button.seg-learning .seg-dot { color: var(--color-warning); }
.vocab-segmented button.seg-mastered .seg-dot { color: var(--color-success); }

/* 选中态：surface（白纸感抬起）+ 微阴影 + 语义色文字 + 加粗 */
.vocab-segmented button[aria-pressed="true"] {
  background: var(--color-surface);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(28, 27, 24, 0.08), 0 0 0 0.5px rgba(28, 27, 24, 0.08);
}
.vocab-segmented button[aria-pressed="true"].seg-new      { color: var(--color-primary); }
.vocab-segmented button[aria-pressed="true"].seg-learning { color: var(--color-warning); }
.vocab-segmented button[aria-pressed="true"].seg-mastered { color: var(--color-success); }
```

### B.7 验收（跑冒烟）

- 点词卡展开：例句 → 状态（Segmented）→ 复习评价 三段可见。
- 当前状态段处于"抬起"（surface 底 + 阴影 + 语义色文字 + 加粗），点其他段瞬时切换 + `state.expandedId` 保持展开不折叠。
- 切换状态后，收起态徽章跟随更新（即上方的 `<span class="vocab-status-tag">` 类名从 status-new → status-learning）。
- 徽章 hover/tap 无任何视觉反馈（这是**特性**——它已不是按钮）。

---

## F. 首次访问提示（可选一次性 tooltip）

**目的**：老用户已知"点徽章切换"的肌肉记忆需要重定向。

在 `js/vocab.js` `render()` 顶部加：

```js
function shouldShowStatusHint() {
  try { return !localStorage.getItem('vocabStatusHintDismissed'); } catch (e) { return false; }
}
function dismissStatusHint() {
  try { localStorage.setItem('vocabStatusHintDismissed', '1'); } catch (e) {}
}
```

在 `.vocab-sticky-tabs` 之后、`.vocab-due-toggle` 之前插入：

```js
var hintHtml = shouldShowStatusHint()
  ? '<div class="vocab-status-hint" id="vocab-status-hint">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/></svg>' +
      '<span>状态切换已改为「点开词卡后选择」</span>' +
      '<button class="hint-close" aria-label="关闭">×</button>' +
    '</div>'
  : '';
```

`bindEvents` 里加：

```js
var hint = container.querySelector('#vocab-status-hint');
if (hint) hint.querySelector('.hint-close').addEventListener('click', function () {
  dismissStatusHint();
  hint.remove();
});
```

CSS：

```css
.vocab-status-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: var(--color-paper-alt);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-ink-2);
}
.vocab-status-hint svg { width: 16px; height: 16px; flex: 0 0 auto; color: var(--color-ink-3); }
.vocab-status-hint .hint-close {
  margin-left: auto;
  background: transparent; border: 0;
  color: var(--color-ink-3); cursor: pointer;
  font-size: 16px; line-height: 1; padding: 4px 6px;
  min-width: 44px; min-height: 44px;   /* HIG */
  display: inline-flex; align-items: center; justify-content: center;
}
```

---

## G. 必做的收尾（老费）

1. **sw.js 缓存版本升一版**：本卡改了 `app.css` + `js/vocab.js`，`CACHE_APP` 版本号 +1（当前 v7 → v8），否则老用户拿旧缓存看不到 sticky。
2. **测试**：`npm test`（若有单元测试，vocab 相关的 sm2/reviewWord/setStatus 不受影响，应该全绿）。
3. **视觉回归**：改完后跑一次 `evidence` 脚本，把 `evidence/after/11-vocab.png` + `11-vocab-tall.png` 更新，交给严叔比对。

---

## H. 不做什么

- **不动 SM-2 算法**：`sm2()` / `reviewWord()` / `dueDate` 逻辑一字不改。
- **不改词库数据结构**：`window.VOCAB_DATA` 每条记录的字段不变。
- **不加 Swipe Action**：A 案的手势方案留在 F1（未来 P2 追加"卡片左滑→已掌握"高手快捷键）。
- **不改其他页面**：全站审查（首页/对话/语法/我）无同类问题，本卡不动。

---

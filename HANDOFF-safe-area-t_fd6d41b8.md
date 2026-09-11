# HANDOFF · t_fd6d41b8 · iOS PWA 安全区适配

**分支**：`language-tutor/t_fd6d41b8-ios-pwa-tab-bar`
**类型**：工程规格 + 落地实施（本卡属"框架层规格题"，无审美自选）

---

## 问题（量化）

赤拔在真机 iOS PWA standalone 模式下反馈"底部状态栏切换、顶部内容露出都不够完整"。剖开数值：

### 底部 Tab Bar

```css
/* 旧 */
:root { --tab-bar-height: 82px; }
.tab-bar {
  height: var(--tab-bar-height);                              /* 固定 82 */
  padding: 8px 8px calc(8px + var(--safe-bottom));            /* iPhone: pb = 42 */
}
```

iPhone Home Indicator inset = 34px。Tab Bar 内容**可用高度** = 82 − 8 − 42 = **32px**。图标 24 + gap 4 + label 10 = **38px**——**超出 6px，被强制压扁**。桌面无 safe-area 时 padding-bottom = 16，内容可用 = 82 − 24 = 58px，与图标 38px 不匹配，剩 20px 分散上下 → **桌面 tab bar 显得过高、图标飘忽不定**。

### 顶部内容

```css
.page-outlet {
  padding-top: calc(var(--space-2) + var(--safe-top));  /* iPhone: pt = 47 + 8 = 55 */
}
```

顶部适配**已正确**（safe-top 已经叠加 8px 呼吸），标题距屏幕顶约 65 CSS px。**未改动，仅确认规格**。

### Sticky 组件

```css
.vocab-sticky-tabs { position: sticky; top: 0; }  /* 旧 */
```

滚动 stuck 时 sticky 元素上边缘落在 `.page-outlet` 的 padding-box 顶端（= 屏幕顶 0px），穿透 padding-top 的 safe-top 留白，**贴到状态栏**。iPhone 上 vocab 场景 tab chip 被状态栏 47px 遮挡。

---

## 设计规格（决策）

三处一次性修，全站生效。**决策已录 DESIGN.md § Decision Log · 2026-09-11 · t_fd6d41b8**，此处只摘钉子。

### 1) Tab Bar：拆两段

- 新增变量 `--tab-bar-content-h: 54px`（8 顶 padding + 24 icon + 4 gap + 10 label + 8 底 padding，图标 stroke 1.7px 需求下的紧凑最小值）
- `--tab-bar-height: calc(var(--tab-bar-content-h) + var(--safe-bottom))`
- `.tab-bar { height: calc(54px + safe-bottom); padding: 0 8px safe-bottom; }`——内容永远 54px；Home Indicator **叠加**为额外 padding-bottom，**不吃内容**
- `.tab-item { min-height: 54px; padding: 8px; }` —— tap target 54px > iOS HIG 最小 44pt

数值验证（Playwright）：
- 桌面 1440×900：tab-bar.height = **54px**（比旧版 82px 精简 33%）
- iPhone 13 模拟（safe-bottom=34）：tab-bar.height = **88px**（比旧版 82px 高 6px，Home Indicator 独立留白，视觉更饱满）

### 2) 顶部安全区：保持 + 明确

- `.page-outlet { padding-top: calc(env(safe-area-inset-top, 0px) + var(--space-2)); }` **未改**
- 明确 `space-2 = 8px` 为通用最小呼吸；每个页面自行加自己的 `padding-top`

### 3) Sticky top 统一

- 所有 `.page-outlet` 内 `position: sticky; top: 0` 组件改为 `top: var(--safe-top)`
- 本卡改到的：`.vocab-sticky-tabs`（词库场景 chip）
- **规范补充到 DESIGN.md**：今后任何 sticky 顶栏 top 都必须走 `var(--safe-top)`

---

## 修改清单

| 文件 | 段 | diff |
|---|---|---|
| `DESIGN.md` | `components.tab-bar.height` | `82px` → `54px`（+ 4 行注释） |
| `DESIGN.md` | `## Layout` | Tab Bar 描述改为拆两段说明；`page-outlet padding-top` 明确公式 |
| `DESIGN.md` | `## Decision Log` | 新增 `2026-09-11 · t_fd6d41b8` 完整决策条目（+53 行） |
| `app.css` | `:root` | `--tab-bar-height` 拆为 `--tab-bar-content-h: 54px` + `calc(content + safe-bottom)` |
| `app.css` | `.tab-bar` | `padding: 8 8 calc(8+safe)` → `padding: 0 8 safe-bottom` |
| `app.css` | `.tab-item` | +`min-height: var(--tab-bar-content-h)` |
| `app.css` | `.vocab-sticky-tabs` | `top: 0` → `top: var(--safe-top)` |
| `sw.js` | `CACHE_APP` | `v8` → `v9`（app.css 变更） |

---

## 验收 checklist（逐条对齐卡上）

1. ✅ **赤拔视角**：Tab Bar 内容严格 54px，Home Indicator 34px 独立留白叠加在下方——不再吃内容；页面顶部标题距屏顶 ≥ 55px（safe-top 47 + space-2 8），不贴状态栏
2. ✅ **底部 padding**：`.tab-bar padding-bottom: var(--safe-bottom)`（= `env(safe-area-inset-bottom, 0px)`）；`.tab-bar height: calc(54px + var(--safe-bottom))`——iPhone = 88px 符合 iOS HIG（Tab 内容 ≥ 49pt + 安全区）
3. ✅ **顶部**：`.page-outlet padding-top: calc(env(safe-area-inset-top, 0px) + var(--space-2))`——本次未改，规格确认
4. ✅ **viewport-fit=cover**：index.html:5 已配置，未改
5. ✅ **Playwright 390×844 实测**：`scripts/screenshot-safe-area.mjs` 模拟 iPhone 13 notch (47/34) + iPhone 15 Pro island (59/34) 两档 safe-area，全 5 tab 页截图存 `evidence/safe-area-after/`，与 `evidence/safe-area-before/` 一一对应

---

## 证据

- `evidence/safe-area-before/` × 10 张（旧版）
- `evidence/safe-area-after/` × 10 张（新版）
- 关键 vision 复核：`evidence/safe-area-after/iphone13-notch/02-vocab.png`——Tab Bar 图标+文字自然居中，图标底缘距屏幕底约 40 CSS px 纯米白留白（含 Home Indicator 34 + tab-item padding-bottom 8）；桌面 Chrome 1440×900 tab-bar.height = 54px 精准
- 测试：`npm test` 15/15 pass（voice-interaction 测试不受本卡影响）

---

## hotspot（下一张卡）

- **`.conv-composer` sticky bottom 定位**（`app.css:2105-2183` + `js/conversation.js`）——composer sticky bottom:0 相对 `.page-outlet` padding-box 底部，实际停在距屏底 82+24=106px 处而非贴 tab bar 上方。**本卡范围外**。
- **首页空态**（未评估用户）——`home.js` 显示"完成评估解锁"CTA 但整屏其他内容全空。不属安全区问题，属产品设计。

---

## 不做的事

- 不改功能逻辑（本卡明确）
- 不做三案自决——iOS PWA 安全区是规范硬约束，不是审美自选题；数值决策依据全部记入 DESIGN.md Decision Log 可查

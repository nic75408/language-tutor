# 语言学习助手 · iOS HIG 全局交互审计

任务：t_9aeaf1dc  
分支：`language-tutor/t_9aeaf1dc-ios-hig`  
截图 evidence：`evidence/before/*.png`（iPhone 13 · 390×844 · @2x）

审计方法：
1. `python3 -m http.server 8765` 本地起服务
2. Playwright + iPhone 13 device profile 截图 5 个 tab + 3 个二级页 + 评估首屏
3. `vision_analyze` 逐张与 DESIGN.md/HIG 对照
4. 结论按「明确违反 spec / 违反 HIG / 三案自决点」三类归档

---

## 结论摘要

发现问题 **17 处**，按严重度分类：

| 严重度 | 数量 | 处理 |
|---|---|---|
| S1（明确违反 DESIGN.md）| 6 | 本卡直接修 |
| S2（违反 iOS HIG 硬约束）| 4 | 本卡直接修 |
| S3（品味优化，三案自决）| 3 | 本卡定稿 + 落地 |
| S4（次要，留下不修）| 4 | 记录，未来单独卡 |

---

## S1 · 明确违反 DESIGN.md（本卡修）

### S1-1 · `vocab-status-badge` 用了紫色/橙色/绿色的**互联网通用色板**，脱离系统色

**证据**：`evidence/before/11-vocab.png` — 「新词」是靛蓝紫、「学习中」是橙、「已掌握」是薄荷绿。app.css:576-590：
```css
.vocab-status-badge.status-new { background: #eef2ff; color: #4f46e5; }
.vocab-status-badge.status-learning { background: #fff7ed; color: #c2410c; }
.vocab-status-badge.status-mastered { background: #ecfdf5; color: #059669; }
```

**Spec 期望**：DESIGN.md `badge-new / badge-learning / badge-mastered` 分别是 `primary-soft #F6E4DE + primary #B23A28`、`warning-soft #EFE7D2 + warning #6B5218`、`success-soft #E4EADF + success #4A6B3C`。

**修复**：改用 DESIGN.md token。

---

### S1-2 · `vocab-scene-tab.active` 用书签红做底色，违反 `chip-active` spec

**证据**：`evidence/before/11-vocab.png` 顶部「全部」是书签红胶囊。app.css:509-513：
```css
.vocab-scene-tab.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}
```

**Spec 期望**：DESIGN.md `chip-active` 定义是 `backgroundColor: ink (#1C1B18) + textColor: paper (#F7F3EC)`。书签红只出现在「书页里被红笔圈出的重点」——tab active、纠错、进度、CTA hover——不作为筛选 chip 的底色。

**修复**：底色改 `--color-ink`，字色改 `--color-paper`。

---

### S1-3 · `vocab-card` 圆角 12px、`vocab-card-detail` 与 spec 不一致

**证据**：`evidence/before/11-vocab.png` 每张词卡明显 iOS 15+ 圆角感。app.css:541-546：
```css
.vocab-card { border-radius: 12px; ... }
```

**Spec 期望**：DESIGN.md `rounded.sm = 4px`（`card` 默认）。12px 不在 shape 白名单（`2/4/10/14/20/999`）——不用 8/12/16 是明确 Don't。

**修复**：改 `--radius-sm` (4px)。

---

### S1-4 · `vocab-review-btn` 4 色（红/橙/蓝/绿）纯饱和，违反「不用饱和红绿蓝」

**证据**：app.css:661-676 —「Again#ef4444 / Hard#f59e0b / Good#3b82f6 / Easy#10b981」是标准 Anki 系配色，饱和度过高，与"编辑室天然颜料色"审美冲突。DESIGN.md Don't：
> **不用饱和绿/黄/红做进度或状态**——那是游戏化奖章的语言。

**修复**：改为 spec 色板：
- Again → `--color-primary` (书签红做纠错强调，符合"红笔"隐喻)
- Hard → `--color-warning` (深琥珀)
- Good → `--color-ink` (近黑，作为「默认继续」)
- Easy → `--color-success` (墨绿)

---

### S1-5 · 页面标题前加 emoji（`📊 首页` / `📋 4 周学习计划`）破坏编辑室气质

**证据**：`evidence/before/10-home.png`、`15-plan.png`。js/home.js:65、92 与 js/plan.js。DESIGN.md 全局用衬线 headline，没有为 emoji 前缀留位置；`Kinfolk/Atlantic` 参照系里绝无标题前 emoji。

**修复**：去掉 `📊 📋`。改为**纯衬线大字标题**。（快捷入口内容层的 emoji 保留——那是产品语言，不是视觉框架。）

---

### S1-6 · `plan-page` 返回按钮不是 40×40 胶囊，只是 24px 字符 `←`

**证据**：`evidence/before/15-plan.png` 左上返回符号极小。DESIGN.md `page-header-back` 全局约定 40×40 胶囊 + 20px 左箭头（沿用 t_a312968d）。语法详情页做对了（app.css `.grammar-header-back` 与全局 `.page-header-back` 都是 40×40），但学习计划页/对话场景页存在差异需检查。

**修复**：`.plan-page` 复用 `.page-header-back` class。

---

## S2 · 违反 iOS HIG 硬约束（本卡修）

### S2-1 · Checkbox 触控目标严重不足（18-20 × 18-20，远小于 44pt）

**证据**：多页出现：
- 词库 `.vocab-due-toggle` 里 18×18 系统 checkbox
- 首页 `.home-task-checkbox` 20×20
- 学习计划 `.plan-task-checkbox` 20×20

HIG 硬约束：**任何 tap 目标 ≥ 44×44pt**。视觉大小可以小，**热区必须扩到 44**。

**修复**：见「三案自决 D1」。

---

### S2-2 · `conv-composer` 输入框和 icon 按钮 34-40px 高，全部低于 44pt

**证据**：app.css:1815-1855：
- `.conv-composer input[type=text] { height: 40px }`
- `.btn-send { width:40; height:40 }`
- `.btn-mic { width:40; height:40 }`
- `.icon-btn { width:34; height:34 }` — 最严重

HIG 硬约束：**44pt tap target**，尤其是**输入完立即发送**的场景，误触代价大。

**修复**：
- `.conv-composer input` height 40 → 44
- `.btn-send / .btn-mic` 40 → 44
- `.icon-btn` 34 → 44（视觉可保留 icon 24px，容器 padding 撑到 44）
- 更新 `input-text.height` 与 `button-mic.size` 对应 DESIGN.md token 到 44

---

### S2-3 · `conversation-scene` 返回按钮里显示的是 `‹`（弯尖括号）而不是 `←`

**证据**：`evidence/before/17-conversation-scene.png` — 左上按钮显示 `‹`。iOS 系统级返回全是 **左箭头 ←**（详见 t_a312968d / t_1bfbf0ed 决策）。用 `‹` 是"iOS 7 之前的 Chevron"，弯尖括号更像"折叠面板箭头"。

**修复**：所有 `.page-header-back` 内部字符统一为 `←` (U+2190) 或 20×20 SVG 左箭头。

---

### S2-4 · Composer 距底部 tab-bar 无 safe-area 与视觉隔离，输入时可能触发 tab

**证据**：app.css:1815：
```css
.conv-composer { position: sticky; bottom: 0; ... }
```
但 conversation 页面隐藏了 tab-bar（`updateChromeForRoute` 里 `TAB_ROUTES` 不含 `conversation` 子路由——需 grep 确认）。看代码 `app.js:60`：`TAB_ROUTES` 含 `conversation`，即**对话 tab 保留 tab-bar**。这意味着 composer 与 tab-bar 之间必须有物理分隔。

**修复**：
- `.conv-composer` 加 `border-top: 1px solid var(--color-rule)` 与 tab-bar 视觉分开
- `padding-bottom` 加 `env(safe-area-inset-bottom)` 兜底（当在场景对话页且 tab-bar 隐藏时）
- 检查是否需要 `.page[data-page="conversation-scene"]` 隐藏 tab-bar；此点属于产品层决策，本卡记入 S4 待议

---

## S3 · 品味优化（本卡三案自决 → 落地）

### D1 · Checkbox 触控热区扩展策略（S2-1 的解法）

**问题背景**：DESIGN.md 明确 `checkbox size: 18px`——18 是**视觉尺寸**，好看、克制、书本感。但 HIG 硬约束 44pt tap target。矛盾解决：**视觉 18，热区 44**。三案分野在"如何把 26px 空气热区放到 18px 视觉框周围"。

#### 方案 A · `::before` 透明扩展器（保留视觉，热区不入布局）
```css
.checkbox { position: relative; width:18px; height:18px; ... }
.checkbox::before {
  content: ''; position: absolute;
  inset: -13px;  /* 18 + 13*2 = 44 */
}
```
- 优点：视觉零变，DESIGN.md 数值一字不改；不影响卡内布局；HIG 合规
- 缺点：热区落在 checkbox 相邻元素上时会重叠；`::before` 无法作为 `<button>` 的 tap target 单独触发

#### 方案 B · 整行热区（checkbox 视觉 18，父行 44 高、整个可点）
```css
.home-task-card { min-height: 44px; cursor: pointer; }
/* 整行点击 = 打勾/取消勾 */
```
- 优点：符合"任务行"心智模型（列表项整行可点是 iOS 惯例）；与 `<a class="home-task-body">` 冲突需拆分为两个热区（勾/详情）
- 缺点：会与「点整行进入详情」的既有 <a> 打架——需要拆分「左侧 44×full-height 勾选热区」+「右侧文本 → 详情链接」

#### 方案 C · Checkbox 视觉升级到 24（不改到 44 保持轻量），热区 44
```css
.checkbox { width:24px; height:24px; }
.checkbox::before { inset: -10px; /* 44 */ }
```
- 优点：24px 是 iOS 系统 checkbox 大小（Reminders / Notes），HIG 惯例；heat 区仍需扩展 10px
- 缺点：DESIGN.md 已定 18px；从"书本感"下坡到"iOS 系统 UI 感"

#### 打分（自评 5 项 × 5 分 = 25）

| 项 | A | B | C |
|---|---|---|---|
| 与 DESIGN.md 一致性 | 5 | 4 | 3 |
| HIG 合规（44pt） | 5 | 5 | 5 |
| 与既有 `.home-task-body <a>` 兼容 | 5 | 3 | 5 |
| 实现简洁 | 5 | 3 | 5 |
| 触屏体感（是否易误触相邻） | 4 | 5 | 4 |
| **合计** | **24** | **20** | **22** |

**定稿：A 方案**。理由：DESIGN.md 数值不改；实现最轻（一个伪元素）；与整行链接可共存（`::before z-index` 定位在链接之上但视觉透明）；误触相邻的风险由 `inset: -13px` 的 26px 隔离带很小。落选 B 的最大问题是要改 `.home-task-body <a>` 结构；落选 C 会打破书本感往 iOS 系统 UI 靠。

---

### D2 · Icon button 尺寸从 34 升到 44 的视觉重心补偿

**问题**：`.icon-btn` 34×34 升到 44×44 后，视觉重心会变"大按钮小图标"。三个候选：

- **A** 按钮 44 + 图标保持 16px → 中空感
- **B** 按钮 44 + 图标升到 20px → 中庸
- **C** 按钮视觉 34（透明边界扩到 44）+ 图标 15px → 视觉不变、热区合规

**定稿：C**。同 D1 逻辑——视觉尺寸是 DESIGN.md 的语言，触控是 HIG 硬底线，用透明热区隔离两者。落地用 `padding: 5px` + 无边框（视觉边界不变）。

---

### D3 · 首页 `🔥 连续学习天数` emoji 是否留

**问题**：DESIGN.md Don't 里说「不用饱和红绿蓝做状态」但没直接禁 emoji。`🔥` 是"streak"惯例（GitHub / Duolingo / Snapchat 都用），产品语言 ≠ 视觉框架。

- A 保留 🔥（惯例、直觉）
- B 换纯 mono 数字 + 米色/古铜金背景（一致编辑室气质）
- C 换成古铜金 SVG 小图标（火焰或月桂叶，1.7px stroke）

**定稿：B**。理由：`streak` 数据已在古铜金卡里，视觉高对比且区别于日常事件——不需要再加 emoji 强调。emoji 系统色是 iOS 系统的（红/橙），跟 `--color-gold` 视觉分裂。B 案改为「Streak · 3 · DAYS」全 mono kicker，最"编辑室"。落选 A 的问题正是 emoji 破坏色板一致性；C 需要额外画 icon，成本高、收益边际。

---

## S4 · 记录不改（未来单独卡）

| # | 问题 | 为什么不在本卡改 |
|---|---|---|
| S4-1 | 场景 chip 里 emoji（✈️💬💼）、场景卡 emoji | 需重新画 line icon 一套，工作量单独立卡 |
| S4-2 | 语法详情正误例句 ✅❌ emoji | 同上；且 ✅❌ 有语义，替换要保留意义 |
| S4-3 | 词条卡上「日常」「打招呼」两个 tag 圆角 6px | 与 `--radius-md` 10 或 `--radius-sm` 4 都不完全一致，需产品决策：tag 是可点筛选还是纯标签？影响是否用胶囊 |
| S4-4 | Home streak card 用「🔥」的问题 | 已在 D3 决策 → B 案，本卡实施 |

*S4-4 复选：其实要改，移到本卡实施。*

---

## 修复清单（本卡实施）

- [x] audit 报告落盘
- [ ] app.css 修 S1-1..6、S2-1..3、D1、D2、D3
- [ ] DESIGN.md 追加 iOS HIG 检查节 + Decision Log 条目
- [ ] evidence/after/*.png 重新截图对照
- [ ] commit

## 不做

- **不改功能逻辑**（词库复习算法、评估流程、对话流程）
- **不动 grammar 模块视觉**（已合规）
- **不重画 icon 集**（S4-1）
- **不动 A11y 之外的国际化/键盘**（S4 外）

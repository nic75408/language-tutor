# Icon 三案自评（t_fae84c24 · 2026-09-10）

三案分野轴：**图标手法**（不是选大厂皮肤，是决定 SVG 描/填/粗细手法）。

## 评分表（25 分制 · 5 维度 × 5 分）

| 维度 | A · SF Symbols 原生 | B · Editorial Hairline | C · SF Duotone |
|---|---|---|---|
| 美观（视觉平衡） | 4 | 5 | 3 |
| 一致性（12 场景同重量） | 5 | 5 | 4 |
| 与设计系统同源 | 4 | 5 | 2 |
| 无 AI 感 | 5 | 4 | 4 |
| 触屏可辨识 | 5 | 3 | 5 |
| **总分** | **23** | 22 | 18 |

## 定稿：方案 A

**依据**：

1. **赤拔原话锚定** — "都用 iOS 官方的 icon 库"，SF Symbols Regular weight（1.7px equivalent）就是 iOS 系统 icon 的默认样式。方案 A 是原话最直译。
2. **tab bar 现有手法本来就是 A** — DESIGN.md 已定 tab bar stroke 1.7px（从 t_51de6008 三案的 C 案吸收）。把 A 推广到全站 = 让 tab bar 不再是"孤岛干净"，而是"全站同源"。
3. **触屏可辨识满分** — B 案 1.2px 在 stat-row 18px 尺寸下确实糊了（vision 已确认），语言学习工具要看很多小指示（stat/arrow/status），不能牺牲清晰度换气质。
4. **克制美学胜出** — C 案 12 场景 icon 全带 20% fill 形成"色块阵列"，与 Newsprint 编辑室"纸面文字为主"的克制性格冲突。学习工具不是编辑器，不需要那种强激活语义。

## 从落选案吸收的细节

### 从 B 吸收
- **页面标题 icon 用 Regular weight**（stroke 1.7px 不加粗），视觉重量略轻于 Serif 600 标题字。避免"icon 抢戏"。
- **深色底控件 stroke 保持 1.7px 不降**（B 的教训）——Session hero card 深墨绿底上的 icon 依然 1.7px，不用更细。

### 从 C 吸收
- **tab bar 激活态**：**默认只换色**（primary 书签红），不加背景填充——保留 A 的"克制"。但当未来出现 "toggle 型"控件（如朗读开关 🔊/🔇）需要强激活反馈时，允许用 `.btn-icon.active` 背景反转（ink-1 底 + paper 描边），这是 C 案的正确观察。

## 落选记录

- **B 落选**（22/25）：略 hipster；stat 小尺寸糊；深底控件掉可读性。若未来产品重心从"日常刷"转向"沉浸阅读长文"，B 可复评。
- **C 落选**（18/25）：色块阵列扰乱注意力；SVG DOM 体积翻倍；与克制美学有张力。仅 duotone 手法本身留作"tab bar 激活态背景反转"的备胎（吸收进 A）。

## 三案对比截图

- `sketches/icons-A-sf-symbols/index.html` → `/tmp/sketch-A-sf-symbols-iphone.png`
- `sketches/icons-B-hairline/index.html` → `/tmp/sketch-B-hairline-iphone.png`
- `sketches/icons-C-duotone/index.html` → `/tmp/sketch-C-duotone-iphone.png`

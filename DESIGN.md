---
version: alpha
name: Tutor · Newsprint
description: 「跟一位有教养的老师读一本英文书」——米白纸感、衬线大标题、书签红强调，为成年中文母语学英语者做的私教工具。
colors:
  # 表面（纸感底、卡片、次级面）
  paper:        "#F7F3EC"   # 主底——米白纸感，非纯白
  paper-alt:    "#EEE8DD"   # 分区/悬浮底
  surface:      "#FFFFFF"   # 卡片纯白（少用，用于需要"新纸"感的组件）
  surface-deep: "#253830"   # 深墨绿容器（Session hero / 强调块，源自 B 案）

  # 文字（近黑体系，暖调，不用纯黑）
  ink:          "#1C1B18"   # 主文字/标题
  ink-2:        "#5B5750"   # 次级文字/说明
  ink-3:        "#8D8880"   # 三级/占位/元数据
  ink-on-deep:  "#EDE7D5"   # 在深墨绿容器上的文字

  # 强调色（唯一"品牌红"——书签红）
  primary:      "#B23A28"   # 书签红——CTA 强调、进度、活跃 Tab、focus
  primary-soft: "#F6E4DE"   # 书签红 6% 淡底——徽章背景、语法提示

  # 语义色（学习状态、成就）
  success:      "#4A6B3C"   # 已掌握——墨绿，含蓄
  success-soft: "#E4EADF"   # 已掌握徽章底
  warning:      "#6B5218"   # 学习中——深琥珀（过 WCAG AA 4.5:1 on warning-soft）
  warning-soft: "#EFE7D2"   # 学习中徽章底
  gold:         "#6B5122"   # 古铜金——成就/连续天数（深化过 WCAG AA on gold-soft）
  gold-soft:    "#EAE0C7"   # 古铜金淡底

  # 分割/边界
  rule:         "rgba(28,27,24,0.09)"     # 常规细线
  rule-strong:  "rgba(28,27,24,0.18)"     # 强调分割
  rule-on-deep: "rgba(237,231,213,0.18)"  # 在深墨绿上的分割线

typography:
  # 显示层（衬线，用于叙事标题——"跟老师读书"的核心视觉）
  display-l:
    fontFamily: "Source Serif 4"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontFeature: "\"lnum\", \"onum\""
  display-m:
    fontFamily: "Source Serif 4"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"

  # 页面标题（衬线，用于场景标题、词条 en 大字）
  headline-l:
    fontFamily: "Source Serif 4"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  headline-m:
    fontFamily: "Source Serif 4"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.25

  # 品牌 wordmark（"Tutor." 字标专用，衬线加书签红句点）
  brand-mark:
    fontFamily: "Source Serif 4"
    fontSize: 22px
    fontWeight: 700
    letterSpacing: "-0.005em"

  # 正文（无衬线 Inter + 中文 PingFang，混排优化）
  body-l:
    fontFamily: "Inter, -apple-system, PingFang SC, Noto Sans SC, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-m:
    fontFamily: "Inter, -apple-system, PingFang SC, Noto Sans SC, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  body-s:
    fontFamily: "Inter, -apple-system, PingFang SC, Noto Sans SC, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5

  # UI（按钮、Tab、标签）
  ui-l:
    fontFamily: "Inter, -apple-system, PingFang SC, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  ui-m:
    fontFamily: "Inter, -apple-system, PingFang SC, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  ui-s:
    fontFamily: "Inter, -apple-system, PingFang SC, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
  tab-label:
    fontFamily: "Inter, -apple-system, PingFang SC, sans-serif"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.02em"

  # 英文对话主体（衬线，让英文"像书本"）
  english-body:
    fontFamily: "Source Serif 4"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"

  # 元数据/技术标签（等宽小字，报刊感）
  meta:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.05em"
  kicker:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.12em"

  # IPA 音标（等宽避免符号跳动）
  ipa:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3

rounded:
  none: 0px
  xs:   2px    # 徽章、内联小方块
  sm:   4px    # 卡片、按钮（书本感——不圆润）
  md:   10px   # 输入框、次级按钮
  lg:   14px   # Session 卡片、大容器
  xl:   20px   # 对话气泡（略圆）
  full: 999px  # 胶囊：主 CTA、语义标签、mic 按钮

spacing:
  # 8px 基准（配合 4px 半格 + 20px "报刊内边"）
  0:   0px
  1:   4px    # 徽章内 padding
  2:   8px    # 元素内间距
  3:   12px   # 组件内小间距
  4:   16px   # 常规组件间距
  5:   20px   # 报刊内边（页面左右 padding）
  6:   24px   # 段间距
  8:   32px   # 大段落间距
  10:  40px   # 章节间距
  12:  48px   # 页面顶/底大留白

components:
  # ============ 底部 Tab Bar（5 项） ============
  tab-bar:
    backgroundColor: "{colors.paper}"
    height: 82px
    padding: 8px
  tab-item:
    typography: "{typography.tab-label}"
    textColor: "{colors.ink-3}"
    padding: 8px
  tab-item-active:
    typography: "{typography.tab-label}"
    textColor: "{colors.primary}"
    padding: 8px

  # ============ 品牌 wordmark ============
  # "Tutor." — 句点是书签红，源自 A 案 header
  brand-wordmark:
    typography: "{typography.brand-mark}"
    textColor: "{colors.ink}"

  # ============ CTA 按钮 ============
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ui-l}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-primary-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-l}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    typography: "{typography.ui-m}"
    rounded: "{rounded.sm}"
    padding: 12px

  # 圆形 mic 按钮（对话页语音输入，40px）
  button-mic:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    size: 40px

  # ============ 输入框（对话 composer） ============
  # textColor 是"用户已输入的文字"色；占位符走 CSS ::placeholder，用 ink-3。
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-m}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 40px

  # ============ 卡片 ============
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 20px
  card-alt:
    backgroundColor: "{colors.paper-alt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 20px

  # Session hero（深墨绿，源自 B 案，用于"今日主课"等强调容器）
  session-hero-dark:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.ink-on-deep}"
    rounded: "{rounded.lg}"
    padding: 22px

  # ============ 对话气泡 ============
  # 用户胶囊（近黑底 + 米白字，书本引文感）
  bubble-user:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.english-body}"
    rounded: "{rounded.xl}"
    padding: 12px
  # 老师气泡（无框——文本直接在纸上，最"读书录"）
  bubble-tutor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.english-body}"
    padding: 4px

  # ============ 徽章（学习状态） ============
  badge-new:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.kicker}"
    rounded: "{rounded.xs}"
    padding: 4px
  badge-learning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.kicker}"
    rounded: "{rounded.xs}"
    padding: 4px
  badge-mastered:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.kicker}"
    rounded: "{rounded.xs}"
    padding: 4px
  # 成就徽章（连续天数、总时长里程碑）——古铜金体系，与日常"新/学习中/已掌握"物理分开
  badge-streak:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold}"
    typography: "{typography.kicker}"
    rounded: "{rounded.xs}"
    padding: 4px

  # ============ Checkbox（任务） ============
  # 未选：细描边空心方形（A 原案）
  checkbox:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    size: 18px
  # 已选：书签红填充（吸收 C 案 accent 色打勾）
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xs}"
    size: 18px

  # ============ 词库筛选 chip ============
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    typography: "{typography.ui-s}"
    rounded: "{rounded.full}"
    padding: 6px
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ui-s}"
    rounded: "{rounded.full}"
    padding: 6px

  # ============ 页面顶部返回按钮（沿用 t_a312968d 全局约定） ============
  # 左上 40×40 胶囊，箭头 20px（详见 Do's 与决策记录）
  page-header-back:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
---

## Overview

「跟一位有教养的老师读一本英文书」。米白纸感 + 衬线大标题 + 无衬线正文 + 书签红作为唯一强调色。三案自决（A/B/C）中 A 案 48/50 胜出（B 45、C 44）——是给成年中文母语者、每日 15-30 分钟学英语的碎片工具，视觉上不消耗心力、可以长期面对。

不是多邻国的卡通风、也不是 Speak 的国际化少年学习感——**更接近 Notion 官网的暖极简 + The Atlantic 的报刊排版 + Kinfolk 的编辑室气质**。

## Colors

系统全部**暖色调**——米白纸底、暖近黑正文、书签红强调。没有纯白、没有纯黑、没有蓝色（除非语义要求）。

- **Paper `#F7F3EC`** — 主底色。米白，接近未漂白棉纸，有一点点黄。**不用纯白**——纯白在长时间阅读时会刺眼、也过于"应用"感。
- **Ink `#1C1B18`** — 主文字。近黑但带 3% 暖调，避免与米白底形成刺目对比。
- **Primary `#B23A28`（书签红）** — 系统唯一强调色。用于：主要 CTA hover 态、活跃 Tab、纠错标记、进度环填充、语法提示。**是"书页里被红笔圈出的重点"，不是 CTA 装饰**——每屏至多 3 处。
- **Semantic**：已掌握 `#4A6B3C` 墨绿、学习中 `#A6822B` 土黄——都是压过色相饱和度的**天然颜料色**，避免"游戏化奖章"感。
- **Gold `#8C6A2F`（古铜金）** — 从 B 案吸收，专用于**长期成就**（连续天数、总时长、里程碑徽章）。与书签红做"日常事件 vs 长期荣誉"的语义区分。
- **Surface-deep `#253830`（深墨绿）** — 从 B 案吸收，用于 Session hero card 等"重要开始/强调"容器（每屏至多 1 处，避免变咖啡厅招牌）。

WCAG：`ink #1C1B18` on `paper #F7F3EC` ≈ 15.5:1，AAA。`primary #B23A28` on `paper` ≈ 5.4:1，AA（普通文本）。

## Typography

**主字体三选一**，各司其职：

- **Source Serif 4**（英文衬线）— 所有英文的**内容主体**：标题、场景名、对话英文、词条 en 大字。选它是因为它有**报刊气质但没有 Georgia 那么书卷气**，opsz 变量字体能适配 12px-64px 全段。
- **Inter**（无衬线）— 所有 UI 元素、按钮、Tab、正文中文、数据说明。Google Fonts 直接可用、中文 fallback 到 PingFang / Noto Sans SC。
- **JetBrains Mono**（等宽）— 元数据（DAY 23、场景 turn、IPA 音标、日期、进度百分比）。等宽让"数据"和"叙事"视觉分开。

**中英文混排原则**：
1. **英文内容主体用 Source Serif 4**（衬线）——让英文"像书本"。
2. **中文辅助解释用 Inter/PingFang**（无衬线）——中文衬线（宋体）在小字号下 iOS 上渲染较弱，无衬线更耐读。
3. **中英同一段落**时：中文字号 -1（英文 16px 时中文 14px），行高 +5%（英文 1.4 时中文 1.55），保持视觉高度平衡。
4. **中文注解出现在英文旁边时**：用**书签红竖线 2px 左引**，与英文物理隔开（详见 Components > 对话气泡）。

**Wordmark**：`Tutor.` — Source Serif 4, 22px, weight 700, `-0.005em` letter-spacing。**句点是书签红 `#B23A28`**——像书封上的印章句读。中文副标签"私教"用 Inter 11px `#8D8880` 跟在后面（可选，用于首屏顶栏）。

## Layout

**基准 8px + 5px 半格**。特殊单位 `--pad-page: 20px`——所有页面左右内边，就叫"报刊内边"。这个数值是"米白纸上留白"的核心，改动前需评估。

- 页面顶部 status bar：44px（iOS 系统）
- App bar：56-68px（含 8px 顶部呼吸、20px 左右）
- 底部 Tab Bar：82px（8px 内边 + 22px 安全区）
- 内容区滚动：`flex:1; overflow-y:auto`，20px 左右 + 4-8px 顶部
- 段间距：`24px`（同章节）、`32px`（跨章节）
- 卡片内边距：`20px`（一致）

**列宽**：单列布局，390 - 40 = 350px 内容宽度。中英文段落最大行长 **65 字符**（英文）/ **34 字**（中文）——即"报刊单栏"经验值。

**边线 tokens（`rule` / `rule-strong` / `rule-on-deep`）** 是给 CSS 层直接消费的边线颜色 token，不进 `components` 白名单——DESIGN.md 的 component 属性白名单当前不包含 `borderColor`。CSS 用法：`border-top: 1px solid var(--color-rule);` 等。lint 会对这三个 token 报 `orphaned-tokens` warning，是 spec 工具的已知局限，非设计缺陷。

## Shapes

**圆角克制**——书本感，不是 iOS 15+ 的圆润。

- `2px` 徽章 / 内联小块
- `4px` 卡片 / 按钮（默认）
- `10px` 输入框 / 图标按钮
- `14px` Session hero 等大容器
- `20px` 对话气泡（略圆，仅气泡）
- `999px` 胶囊：主 CTA、语义状态标签、mic 按钮、返回按钮

**不用**：8px、12px、16px 等中间圆角——避免视觉上出现"多种圆角"。

## Components

### Tab Bar（5 项，是全局导航根组件）

底部固定 82px 高，上边 `1px solid rule` 分割。5 个 Tab 等宽：**首页 · 词库 · 对话 · 语法 · 我**。图标 stroke `1.7px`（从 C 案吸收，比原 1.6px 更清晰）、24×24。激活态：图标 + 文字色 = 书签红 `#B23A28`；未激活：ink-3 `#8D8880`。**不使用底部横线指示器**——颜色变化已足够，加线会显得幼稚。

**图标语义**（决策记录）：
- 首页 = 房屋 stroke（不用星号/仪表盘——房屋是"回家"感）
- 词库 = 书本剖面（一半开一半合，像字典打开时的书脊）
- 对话 = 气泡 + 尾巴（不用两个气泡对话的双向图——单气泡更"你与老师"）
- 语法 = 阶梯行线（长短行组合，像目录/规则条目）
- 我 = 头像半身像

### 对话气泡（三段式）

对话是产品核心，气泡设计承载最多品味决策：

1. **老师气泡（bubble-tutor）**：**无框、直接在纸上**，用 Source Serif 4 16px（`english-body`）呈现英文。前面带一个 22×22 米色圆角 T 头像 + 4px 顶部间距。**当有中文注解时**，在英文下方 6px 处显示一段 body-s 中文，**左侧 2px `primary` 书签红竖线 + 10px padding-left**——像老师在书页边空处用红笔写批注。
2. **用户气泡（bubble-user）**：深墨黑 `#1C1B18` 胶囊底、米白 `#F7F3EC` 字，`rounded.xl (20px)` 右下角 4px（表明"我说的"）。padding `10px 14px`，字体 Source Serif 4 15px。
3. **纠错标签**：紧贴用户气泡下方 6px、右对齐、`primary` 书签红 11px Inter，格式 `✎ a → an extra shot`。**不用完整句子重写**——就一个替换指令 + 前后对照，最省心。

### 词条卡片（词库列表项）

一行一词，间隔 14-18px + 上边 `1px rule`：
- 英文 en：Source Serif 4 18px weight 600（`headline-m`）
- IPA 音标：JetBrains Mono 11px `ink-3`
- 中文释义：Inter 13px `ink-2`，包含 `<em>` 词性 → 释义主体 → 关联提示，`<em>` 用**书签红斜体**
- 例句：Source Serif 4 12px italic `ink-3`，前后带引号
- 右侧状态徽章：8px `xs` 圆角，10px kicker mono，宽 32-56px

### Session hero card（深墨绿，可选强调）

用于**今日主课/开始学习**等"重要开始"场景，每屏至多 1 处。深墨绿 `#253830` 底 + 米白字 + 亮金 `#C9A24A` 进度条 + 米白胶囊 CTA。**不是每屏都要**——过用会让整个页面变"营销页"。

### Checkbox（任务已完成）

- 未选：18×18 `1px ink-3` 描边 + 4px 内边 + 2px 圆角
- 已选：**书签红填充**（吸收 C 案 accent 打勾）+ 米白对勾 SVG
- 已选状态下，任务名 `ink-3` + `text-decoration: line-through`

### page-header-back（沿用全局约定 · 决策记录见下）

**语言学习助手同样沿用**赤拔在艺术手册 t_a312968d 定稿的**左上 40×40 胶囊 + 20px 左箭头**返回按钮范式。iOS 系统级返回全是左箭头（不是 X）——语言学习助手全站也是 push 栈，无 modal sheet 页。所有二级页面（对话详情、语法详情、词条详情）统一用此。

### Icon System（全站统一 · t_fae84c24 定稿）

**手法：SF Symbols 原生等效**（stroke 1.7px · Regular weight · 24×24 viewBox）。全站 icon **一律用内联 SVG**，禁止 emoji、禁止字符（`←→✅❌🎉` 等）、禁止图片。这是"iOS 官方 icon 库"原话的 Web 端最优实现。

**图形规范**：
- `stroke-width: 1.7`（tab bar 现有值，全站沿用；深色底控件不降低）
- `stroke-linecap: round`、`stroke-linejoin: round`
- `fill: none`（激活态可选背景反转，不做 fill 内填）
- `viewBox="0 0 24 24"` 为基础网格
- **实际渲染尺寸表**：

| 使用位置 | 尺寸 | 说明 |
|---|---|---|
| Tab bar | 24×24 | 现有值 |
| 页面标题（h1 前） | 22×22 | 略轻于 Serif 600 大标题字，不抢戏 |
| 场景卡 / shortcut 卡 | 26×26 | 卡片主 icon |
| 状态行 / stat-row / btn-icon | 18×18 | 内联小 icon |
| 箭头（arrow / chevron） | 16×16 | 列表项右侧 chevron |
| Nav back（沿用） | 20×20 | 40×40 胶囊内 |

**颜色 token**：
- 默认 `ink-1 #1C1B18` 描边
- Tab 激活 = `primary #B23A28`（书签红），未激活 = `ink-3 #8D8880`
- Success = `moss #253830`（例句正确、任务完成态）
- Destructive = `primary #B23A28`（清除数据、纠错 X）
- Accent 强调 = `gold #B08842`（考点圆圈、成就徽章）

**Icon 词表**（22 类语义 → SF Symbols 命名 → 用途）：

| 语义 | SF 命名 | 用途 |
|---|---|---|
| `house` | 首页 | tab / 页面标题 / shortcut |
| `book.closed` | 词库 | tab / 页面标题 / shortcut |
| `bubble.left` | 对话 | tab / 页面标题 / shortcut / 场景闲聊 |
| `list.bullet` | 语法 | tab / 页面标题 |
| `person` | 我 | tab / 页面标题 |
| `flame` | 连续天数（streak） | 首页 / 个人中心 |
| `calendar` | 学习计划 / 约朋友出行 | 首页 stat / 场景 |
| `chart.bar` | 词汇掌握 | 首页 stat |
| `cup.and.saucer` | 咖啡店点单 | 场景 |
| `airplane` | 机场过海关 | 场景 |
| `bed.double` | 酒店入住 | 场景 |
| `location.north` | 问路 | 场景 |
| `face.smiling` | 表达感受 | 场景 |
| `briefcase` | 工作会议 | 场景 |
| `envelope` | 邮件跟进 | 场景 |
| `doc.text` | 面试 / 学习记录 | 场景 |
| `waveform` | 自由对话 | 场景 |
| `speaker.wave` / `speaker.slash` | 朗读开/关 | 对话工具栏 |
| `pencil` | 纠错标签（替 `✎`） | 对话下方 |
| `checkmark.circle` | 完成 / 例句正确 | 语法练习 / 任务完成 |
| `xmark.circle` | 答错 | 语法练习 |
| `arrow.triangle.2.circlepath` | 重新测评 | 个人中心 |
| `trash` | 清除数据 | 个人中心（唯一使用 primary destructive 场景） |
| `chevron.right` / `chevron.left` | 列表箭头 / 返回 | 通用 |
| `target` | 考点标记（gold） | 语法练习 |

**分类 chip 去 icon**：对话/词库中"旅行 / 日常 / 工作"分类 chip **只用文字，不加 icon**——原本的 🛫💬💼 是装饰性重复（chip 已有边框和标签），去掉后消除三种 emoji 表情视觉冲突。

**空态不用 emoji**：原本"🎉 全部完成"这类空态提示改用短促文字（例："全部完成"），不加 icon 亦不加 emoji——空态本身就是干净的，加图反而营造"游戏化奖章"感（与 Don't 冲突）。

**禁止清单**：
- ❌ 任何 emoji 字符（Apple 3D 立体渲染是最强"AI 感"来源）
- ❌ 字符替代箭头（`← → ✎ ✅ ❌`）
- ❌ 不同图标手法混用（如 tab bar 用 SVG 而页面标题用 emoji）
- ❌ 引入其它图标库（Font Awesome、Material Icons）—— 手法不一致

## Do's and Don'ts

### Do
- 用 `Source Serif 4` 呈现英文主体内容（对话、词条、场景标题）——让英文"像书本"。
- 用 `Inter` + `PingFang` fallback 呈现所有 UI 元素和中文。
- 中英文注解并列时，用**书签红竖线 + padding-left** 物理隔开。
- 数据、日期、进度、IPA 音标用 `JetBrains Mono` 等宽——让"数据"和"叙事"分开。
- 主 CTA 用**近黑 `#1C1B18` + 米白字**（默认），需要额外强调时才用书签红 `#B23A28`。
- 学习状态用**天然颜料色**（墨绿/深琥珀/古铜金），不用饱和红绿蓝。
- 图标 stroke `1.7px`，激活态换书签红。
- 中文段落里 `<em>`（词性 / 关键概念标记，书签红）**每段至多 1 处**——过用会让"重点"贬值。

### Don't
- **不用纯白 `#FFFFFF` 大面积做背景**——刺眼、失去"纸感"。（可以少量用于需要"新纸"感的卡片。）
- **不用纯黑 `#000000` 做文字**——用 `#1C1B18` 暖近黑。
- **不引入蓝色**（除非未来做超链接语义/Info 提示），此系统的**"链接"就是英文本身**——鼓励用户点词看解释、不是导航到外站。
- **不用饱和绿/黄/红做进度或状态**——那是游戏化奖章的语言。
- **不让书签红出现超过 3 处**每屏——过用会变成"广告色"。
- **不给对话气泡加彩色渐变、投影 blur、glassmorphism**——文本直接在纸上就是最好的对话感。
- **hover 不作为唯一状态载体**——赤拔只用 iPhone，触屏没有 hover，激活态用 `:active` 和填充色变化。

## Decision Log

### 2026-09-10 · t_51de6008 · 视觉与导航框架首建
**决策**：整体视觉走 **A 案 Newsprint 编辑室**（米白纸底 + Source Serif 4 衬线 + 书签红），从 B 案吸收 **Session hero 深墨绿容器** + **古铜金作为长期成就色**，从 C 案吸收 **checkbox 打勾 accent 填充** + **1.7px 图标 stroke** + **词库搜索栏 pattern**。

**依据**：
1. 三案自评 48/45/44——A 在"温暖不幼稚 + 用户拟合 + 扩展性"三项综合最高，B 视觉最惊艳但斜体大字每天看会疲劳，C 工具感强但"少了老师"、与"AI 私教"定位错位。
2. 与赤拔的品味档案对齐——他在艺术手册系列决策的编辑室美学（Songti/Kinfolk/雾玻璃控件/克制强调色）在 A 案的"米白纸感 + 衬线 + 书签红" pattern 里都能找到同源基因。
3. Speak 参照——Speak 的成人学习感来自"编辑器/教科书感"而非"游戏感"，A 案的报刊排版语言最接近。

**风险与预案**：
- **Source Serif 4 中文 fallback 会跳变**——所以中文默认走 Inter/PingFang（无衬线），衬线只留给英文。
- **书签红 `#B23A28` 与语义 danger 同色**——刻意合并："纠错、警示、书签强调"都是"要注意"，语义一致不冲突。老师纠错本身就是"书页里被红笔圈出"。
- **深墨绿 hero 每屏至多 1 处**——不作为默认页面底色，避免变"咖啡厅招牌"。

### 沿用：全局返回/退出交互（源自 artbook t_a312968d）
所有二级页面统一左上角 40×40 雾玻璃胶囊 + 20px 左箭头返回按钮（`page-header-back`）；右滑边缘 ≥80px 触发返回（**起于左边缘、向右方向滑**——iOS 系统级手势方向）；push 栈模型（全站无 modal sheet）。此约定不由本任务发起，来自赤拔在艺术手册项目里已拍板的决定，语言学习助手直接沿用。

### 2026-09-10 · t_fae84c24 · 全站 icon 换 SF Symbols 风格（去 emoji）
**决策**：全站图标统一走 **A 案 SF Symbols 原生等效**（stroke 1.7px · Regular weight · 24×24 SVG viewBox），全面替换 22 类 emoji 和字符（📊📖💬👤🔥🎯✅❌🎉🛫🛂🏨🧭📅💼📧🗂🔊🔇✎🔄🗑←→ 等 26 处使用点），从 B 案吸收"页面标题 icon Regular weight 不加粗"，从 C 案吸收"toggle 型控件激活态背景反转（可选）"。

**依据**：
1. 三案自评 A 23 / B 22 / C 18——A 在"一致性 + 与 tab bar 同源 + 触屏可辨识 + 无 AI 感"四项都是满分或次高。
2. 赤拔原话"都用 iOS 官方的 icon 库"——SF Symbols Regular 就是 iOS 系统 icon 默认样式，A 是最直译。
3. Tab bar 已经是 1.7px stroke（t_51de6008 从 C 案吸收）——全站推广 = tab bar 从"孤岛干净"变"全站同源"，零重构。
4. B 案 1.2px 在 stat-row 18px 尺寸下 vision 已确认发糊，语言学习工具小 icon 太多，不能牺牲清晰度。
5. C 案 12 场景 icon 全带 20% fill 形成"色块阵列"，与 Newsprint"纸面文字为主"克制美学冲突——语言学习不是 dashboard 编辑器，不需要那种强激活语义。

**病灶诊断**（26 处 emoji 使用统计）：
- **页面标题装饰性 emoji**：`📊 首页` `📖 词库` `💬 对话` `👤 我`（4 处，最刺眼的"AI 感"来源，Apple 3D 立体渲染）
- **对话场景卡 emoji**：10 个场景各一（☕🛂🏨🧭💬📅🙂💼📧🗂），6 种视觉密度混杂
- **分类装饰 emoji**：🛫💬💼（3 处，冗余装饰）
- **状态/操作字符**：`✅❌🎯 ✎ 🔊🔇 🔄🗑 ← →`（14 处，与 line-svg 手法混杂）

**风险与预案**：
- **iPhone webview 加载体积**：全站新增约 30 个 inline SVG（每个 ~200 字节），总增 ~6KB gzipped，性能影响可忽略；不引入图标库外部依赖。
- **手写 SVG 语义偏差**：不是真的 SF Symbols license 资产（Apple 不允许 Web 直接用 SF Symbols 文件），而是 SVG icon 手工描出**视觉等效**版本，Regular weight/圆角/round cap 与 SF Symbols Regular 手法完全一致。
- **未来场景扩展**：新增场景（现有 10 个之外）需要在 Icon 词表补录一条并沿用 stroke 1.7px 手法，不允许"新场景用 emoji 临时占位"。

**兼容策略**：
- 场景 icon 定义现在存 `data/scenarios.json` 的 `icon` 字段（原本存 emoji 字符），字段改为 SF 命名字符串（如 `"cup.and.saucer"`），渲染层查 `js/icons.js` 词表拿到 SVG string 后 innerHTML 注入。
- `js/icons.js` 是本次新增的 icon 词表模块——所有 SVG 定义集中此处，其它页面调用 `Icons.get(name, {size, color})` 拿字符串。

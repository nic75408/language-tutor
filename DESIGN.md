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

  # 圆形 mic 按钮（对话页语音输入，44px 命中 HIG tap target）
  button-mic:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    size: 44px

  # ============ 输入框（对话 composer） ============
  # textColor 是"用户已输入的文字"色；占位符走 CSS ::placeholder，用 ink-3。
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-m}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 44px

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

### 2026-09-10 · t_9aeaf1dc · iOS HIG 全局交互审查

**决策**：对全站做一轮 iOS HIG 合规审查，发现 17 处问题（audit 见 `AUDIT-ios-hig.md`），本卡实施 S1（6 处 spec 违反）+ S2（4 处 HIG 违反）+ D1/D2/D3（3 处品味自决）+ S4-4（`🔥` emoji 去除）。

**关键 spec 修订（token）**：
- `button-mic.size` 40px → 44px（HIG tap target）
- `input-text.height` 40px → 44px（同）

**关键规则（进入 Do's）**：见下节「HIG 触控热区规则」。

**依据**：
1. iOS HIG「Provide ample touch targets for interactive elements. Try to maintain a minimum tappable area of 44pt x 44pt for all controls.」
2. 赤拔只在 iPhone 上用本产品——桌面 hover 态在真机上不存在，触控热区不足是**功能性缺陷**而非风格差异
3. 与 DESIGN.md「视觉尺寸」的张力用「视觉 N · 热区 44」透明扩展器解决（D1 A 方案 24/25 胜）

## HIG 触控热区规则（Do's 补充）

**核心**：所有可点击控件热区 ≥ 44 × 44pt，视觉尺寸可以更小。视觉是 DESIGN.md 的语言，触控是 HIG 硬底线。

**扩展手法（三选一，按场景）**：

1. **透明 `::before` 扩展器**（视觉小、独立控件）
   ```css
   .checkbox { width:20px; height:20px; position:relative; }
   .checkbox::before { content:''; position:absolute; inset:-12px; /* 44 */ }
   ```
   用于：checkbox、小图标按钮。DESIGN.md 数值一字不改。

2. **`min-height: 44px` + inline-flex**（label / row / chip）
   ```css
   .label-row { display:flex; align-items:center; min-height:44px; padding:6px 0; }
   ```
   用于：radio label、`<input>` 关联 label、场景 chip、设置项。

3. **视觉边框 `::before` 分离**（icon button，视觉小胶囊+大热区）
   ```css
   .icon-btn { width:44px; height:44px; background:transparent; position:relative; }
   .icon-btn::before {
     content:''; position:absolute; width:34px; height:34px;
     border-radius:999px; border:1px solid var(--color-rule); background:var(--color-paper);
     z-index:-1;
   }
   ```
   用于：对话工具栏图标按钮、"翻译"、"播放"这类辅助控件。

**明确清单**：任何 `<button>`、`<a>`、`<label>` 关联的可点击元素，只要计算高 < 44 或宽 < 44，必须用上述手法之一扩展。审查时 QA 用 DevTools 查每个可点击元素的 bounding rect。

**特例**：内容 tag（如词条上「日常」「打招呼」如果不可点击）不算 tap target，可保持 ~24px。可点/不可点的判断以 DOM 是否绑 event handler / `<a href>` / `<button>` 为准。

### Do（补充 · iOS HIG）
- 所有 tap 目标热区 ≥ 44×44pt（视觉不必 44）——见上「HIG 触控热区规则」
- 返回按钮字符统一 `←` (U+2190)，禁用 `‹`（弯尖括号）——iOS 系统级返回全是左箭头
- 页面 title 不加 emoji 前缀（`📊 首页` ✗；`首页` ✓）——emoji 破坏"编辑室"气质；产品内容层的 emoji（场景、任务类型）另论
- Streak / 长期数据用古铜金卡 + mono 数字 + kicker 副标签（`连续学习 · 天`），不用 `🔥` emoji——emoji 色彩来自 iOS 系统色板，与 `--color-gold` 视觉冲突
- Composer 与底部 tab-bar 之间用 `border-top: 1px solid var(--color-rule)` 视觉分隔，避免误触
- 复习 4 按钮（Again/Hard/Good/Easy）用 DESIGN.md 色板（primary/warning/ink/success），不用 Anki 默认红橙蓝绿

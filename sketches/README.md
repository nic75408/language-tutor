# Sketches · 语言学习助手视觉起手三案

## 任务
t_51de6008 · 为「语言学习助手」PWA 设计整体视觉风格与导航框架。产品定位见项目根 PRODUCT.md：AI 英语私教，目标用户是中文母语的成人学习者。

## 分野轴
「学习工具的语气」——同一个专业成人学习产品，可以有三种截然不同的调性表达：

| 案 | 意象 | 灵感 | 关键色 |
|---|---|---|---|
| **A · Newsprint 编辑室** | 跟一位有教养的老师读一本英文书 | The Atlantic / Notion / 报刊排版 | 米白 + 深墨 + 书签红 |
| **B · Study Hall 学者书斋** | 一位有品位的私教在书房教你 | Superhuman / Kinfolk / 精装英汉词典 | 深墨绿 + 米黄 + 古铜金 |
| **C · Studio 现代工具** | 一台精密仪器 | Linear / Cal / iOS Reminders | 纸白 + 近黑 + 靛蓝 |

## 三案自评

按 5 条验收标准 + 品味档案 + 目标用户拟合度打分（1-5 分）：

| 维度 | A | B | C |
|---|---|---|---|
| ① Tab Bar 清晰可辨（成人版） | 4 | 4 | 5 |
| ② 对话页输入布局不拥挤 | 5 | 5 | 4 |
| ③ 成人专业工具感 | 5 | 5 | 5 |
| ④ 中英文混排阅读舒适 | 5 | 4 | 5 |
| ⑤ DESIGN.md token 可落地 | 5 | 5 | 5 |
| 温暖不幼稚（Speak 感） | 5 | 5 | 3 |
| 文化质感 / 品牌记忆点 | 4 | **5** | 3 |
| 目标用户拟合度 | 5 | 4 | 4 |
| 未来扩展性（10+ 页面） | 5 | 4 | 5 |
| 实现难度 | 5 | 4 | 5 |
| **总分** | **48** | 45 | 44 |

## 定稿：A 案 Newsprint 编辑室

**理由**：
1. 温暖不幼稚 5 分（与 B 并列），但 A 在**用户拟合度**和**扩展性**综合最高——B 的深墨绿 hero + 大斜体每天看会疲劳、10 个页面复制模板会累。
2. 血脉与赤拔历史品味档案（艺术手册系列的 Songti/Kinfolk/雾玻璃控件/克制强调色）一致：**编辑室美学**同源。
3. C 案工具感强但"少了老师"，与产品"AI 私教陪你对话"的**人味**定位错位。

**A 案吸收 B 与 C 的部分**：
- 从 B 案取：**深墨绿 hero card**（`session-hero-dark` 组件）用于"今日主课"等强调容器 · **古铜金**作为长期成就色（`badge-streak`）
- 从 C 案取：**checkbox 打勾态用 accent 填充**（比 A 原案纯黑更醒目）· **图标 stroke 1.7px** · **搜索栏 pattern**

## 文件

```
sketches/
├── README.md                 ← 本文件
├── A-newsprint/              ← 胜出方案
│   ├── index.html            (3 屏并排预览：首页/对话/词库)
│   ├── preview.png           (Headless Chrome 1400×980 截图)
│   └── README.md
├── B-study-hall/             ← 落选（保留档案）
│   ├── index.html · preview.png · README.md
└── C-studio/                 ← 落选（保留档案）
    └── index.html · preview.png · README.md
```

## 打开预览

```bash
open sketches/A-newsprint/index.html
open sketches/B-study-hall/index.html
open sketches/C-studio/index.html
```

或直接看 `preview.png`。

## 定稿产出

- **DESIGN.md**（项目根）— Google DESIGN.md token spec 格式，19 color tokens + 16 typography + 25 components，`npx @google/design.md lint` 0 errors
- **tailwind.theme.json**（项目根）— 从 DESIGN.md 导出的 Tailwind v3 theme，供老费实现时使用
- **决策记录**（DESIGN.md 尾部）— 本次三案自决过程与吸收决策，供未来同项目工作参考

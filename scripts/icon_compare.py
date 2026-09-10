#!/usr/bin/env python3
"""生成三案 icon vs Art Daily 现役 icon 的并排对比图，以及 iPhone 桌面模拟图。

三案自决打分证据：
- 系列感（跟 Art Daily 一眼是同族）：底色/字色/字形同源 → 三案同分
- 无框留白（本次核心诉求）：A 最纯，B 有线，C 有点
- iPhone 桌面第一眼可读：小尺寸看单字重量
- 与 Art Daily 未来「去框化」的兼容性：A 最灵活
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CAND = ROOT / "sketches" / "icon-candidates"
ARTDAILY = Path("/Users/david/人文/艺术手册/artbook/icons/icon-512.png")

BG_PAGE = "#F7F3EC"   # 学习助手米白底（比 Art Daily 略浅）
INK = "#1D1B16"
INK2 = "#6B6558"

# ============= 对比图（三案 vs Art Daily） =============
def side_by_side():
    W, H = 1200, 900
    img = Image.new("RGB", (W, H), BG_PAGE)
    d = ImageDraw.Draw(img)

    # 标题（尽量用系统字体）
    CN = "/System/Library/Fonts/STHeiti Medium.ttc"
    try:
        f_title = ImageFont.truetype(CN, 36)
        f_label = ImageFont.truetype(CN, 24)
        f_note = ImageFont.truetype(CN, 18)
    except OSError:
        f_title = ImageFont.load_default()
        f_label = ImageFont.load_default()
        f_note = ImageFont.load_default()

    d.text((60, 40), "语言学习助手 icon · 无框留白版三案 vs Art Daily 现役",
           font=f_title, fill=INK)
    d.text((60, 90),
           "第一行：Art Daily 现役（带框）／候选 A ／候选 B ／候选 C",
           font=f_note, fill=INK2)

    tile = 240
    y = 150
    xs = [60, 60 + 285, 60 + 285 * 2, 60 + 285 * 3]
    labels = ["Art Daily 现役", "A 纯留白", "B 字下细金线", "C 字加金点"]
    files = [
        ARTDAILY,
        CAND / "A-pure-white" / "preview-512.png",
        CAND / "B-tail-line" / "preview-512.png",
        CAND / "C-dot" / "preview-512.png",
    ]
    for x, lbl, f in zip(xs, labels, files):
        icon = Image.open(f).resize((tile, tile), Image.Resampling.LANCZOS)
        # 圆角遮罩（iOS squircle 近似）
        mask = Image.new("L", (tile, tile), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, tile, tile], radius=int(tile * 0.22), fill=255)
        img.paste(icon, (x, y), mask)
        d.text((x, y + tile + 12), lbl, font=f_label, fill=INK)

    # 第二行：小尺寸对比（favicon 尺寸的可读性）
    d.text((60, y + tile + 100),
           "第二行：128×128 缩略图（桌面小图第一眼可读性）",
           font=f_note, fill=INK2)
    y2 = y + tile + 140
    tile2 = 128
    for x, lbl, f in zip(xs, labels, files):
        icon = Image.open(f).resize((tile2, tile2), Image.Resampling.LANCZOS)
        mask = Image.new("L", (tile2, tile2), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, tile2, tile2], radius=int(tile2 * 0.22), fill=255)
        img.paste(icon, (x + (tile - tile2) // 2, y2), mask)

    # 结论
    d.text((60, y2 + tile2 + 60),
           "定稿：A 纯留白 —— 无框、字形本身即装饰、最贴合『留白』意图，",
           font=f_label, fill=INK)
    d.text((60, y2 + tile2 + 90),
           "小尺寸单字重量足够，与 Art Daily 同底同字色同字形血脉。",
           font=f_label, fill=INK)

    out = ROOT / "sketches" / "icon-candidates" / "comparison.png"
    img.save(out)
    print("wrote", out)


# ============= iPhone 桌面模拟 =============
def homescreen():
    W, H = 780, 1200
    img = Image.new("RGB", (W, H), "#2a2723")  # 深灰壁纸模拟
    d = ImageDraw.Draw(img)

    CN = "/System/Library/Fonts/STHeiti Medium.ttc"
    try:
        f_title = ImageFont.truetype(CN, 26)
        f_label = ImageFont.truetype(CN, 18)
        f_app = ImageFont.truetype(CN, 14)
    except OSError:
        f_title = f_label = f_app = ImageFont.load_default()

    d.text((30, 20), "iPhone 桌面模拟：Art Daily「艺」+ 学习助手「语」A 案",
           font=f_title, fill="#F5F1EA")
    d.text((30, 55), "同一屏并排，验证系列感与识别度",
           font=f_label, fill="#B8B0A0")

    # iOS 网格：4 列，圆角 22%
    tile = 128
    label_h = 22
    gutter_x = 40
    gutter_y = 30
    grid_x0 = 60
    grid_y0 = 120

    art = Image.open(ARTDAILY).resize((tile, tile), Image.Resampling.LANCZOS)
    yu_a = Image.open(CAND / "A-pure-white" / "preview-512.png").resize(
        (tile, tile), Image.Resampling.LANCZOS)

    mask = Image.new("L", (tile, tile), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, tile, tile], radius=int(tile * 0.22), fill=255)

    # 第一行：真实相邻场景
    positions = [
        (grid_x0, grid_y0, art, "艺术手册"),
        (grid_x0 + tile + gutter_x, grid_y0, yu_a, "语言助手"),
    ]
    for x, y, ic, name in positions:
        img.paste(ic, (x, y), mask)
        # app 名文字居中
        tw = d.textlength(name, font=f_app)
        d.text((x + (tile - tw) // 2, y + tile + 6), name,
               font=f_app, fill="#FFFFFF")

    # 第二行：小尺寸桌面挤压场景（favicon 级）
    d.text((30, grid_y0 + tile + 80),
           "缩到 favicon 尺寸（32px），仍能一眼分辨",
           font=f_label, fill="#B8B0A0")
    ftile = 96
    fmask = Image.new("L", (ftile, ftile), 0)
    ImageDraw.Draw(fmask).rounded_rectangle(
        [0, 0, ftile, ftile], radius=int(ftile * 0.22), fill=255)
    y3 = grid_y0 + tile + 130
    art_s = Image.open(ARTDAILY).resize((ftile, ftile), Image.Resampling.LANCZOS)
    yu_s = Image.open(CAND / "A-pure-white" / "preview-512.png").resize(
        (ftile, ftile), Image.Resampling.LANCZOS)
    img.paste(art_s, (60, y3), fmask)
    img.paste(yu_s, (60 + ftile + 30, y3), fmask)

    # 说明
    d.text((30, y3 + ftile + 40),
           "对比结论：",
           font=f_title, fill="#F5F1EA")
    lines = [
        "· 底色一致（#F5F1EA 米白）→ 一眼同族",
        "· 字色一致（#8C6D3F 金褐）→ 一眼同族",
        "· 字形一致（Songti 衬线单字）→ 一眼同族",
        "· 无框 vs 带框差异 → 学习助手更松弛，为 Art Daily 未来去框铺路",
    ]
    for i, line in enumerate(lines):
        d.text((30, y3 + ftile + 80 + i * 32), line,
               font=f_label, fill="#E8E0D0")

    out = ROOT / "sketches" / "icon-candidates" / "homescreen.png"
    img.save(out)
    print("wrote", out)


if __name__ == "__main__":
    side_by_side()
    homescreen()

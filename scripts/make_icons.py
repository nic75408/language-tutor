#!/usr/bin/env python3
"""生成 PWA 图标（语言学习助手，与 Art Daily 同风格系列 · 无框留白版）。

t_f1a37dcc 修订：
- 赤拔反馈：icon 不要方形边框，参照最新的 Art Daily 方式，留白。
- 新模板去掉金褐直角画框和内衬卡，只保留米白大底 + 中央 Songti 金褐单字，
  周围纯留白。同色系（BG/FG）不变，保系列血脉。

三案自决（本次修订，无框方向）：
  A 纯留白单字   ── 字占 52%，四周纯留白，极简。
  B 字下细金线   ── 字占 46%，下方 1.5%px 金褐水平细线（长度=字宽 65%），题跋感。
  C 字加金点     ── 字占 50%，右上 4%R 金褐圆点，呼应 Art Daily 印章方案 B。

三案打分定稿：A（详见 sketches/icon-candidates/RESULT.md）。

输出：icon-192, icon-512, icon-512-maskable, apple-touch-icon(180),
      favicon-32, favicon.ico。
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"

# 与 Art Daily 严格同色（系列感第一底层）
BG = "#F5F1EA"      # 米白大底
FG = "#8C6D3F"      # 金褐（字形 + 辅助元素）

SS = 4  # 超采样倍数

SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"


def load_font(path, size):
    if not Path(path).exists():
        raise RuntimeError(f"font missing: {path}")
    return ImageFont.truetype(path, size)


def _ink_bbox(im, bg_rgb):
    bg = Image.new("RGB", im.size, bg_rgb)
    diff = ImageChops.difference(im.convert("RGB"), bg).convert("L")
    bbox = diff.getbbox()
    if bbox is None:
        raise RuntimeError("glyph render produced no ink")
    return bbox


def _render_glyph(char, font_path, size):
    """在临时画布上渲染单字符，返回（图像，墨迹 bbox）。"""
    img = Image.new("RGB", (size * 2, size * 2), BG)
    d = ImageDraw.Draw(img)
    font = load_font(font_path, size)
    bbox = d.textbbox((0, 0), char, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(
        ((size * 2 - w) / 2 - bbox[0], (size * 2 - h) / 2 - bbox[1]),
        char, font=font, fill=FG,
    )
    return img, _ink_bbox(img, BG)


def _paste_glyph_centered(canvas, char, font_path, glyph_h, cx, cy):
    """按墨心 bbox 光学居中，把字符贴到 canvas 的 (cx, cy)。"""
    g, ib = _render_glyph(char, font_path, glyph_h)
    icx = (ib[0] + ib[2]) // 2
    icy = (ib[1] + ib[3]) // 2
    gx = cx - icx + ib[0]
    gy = cy - icy + ib[1]
    canvas.paste(g.crop(ib), (gx, gy))
    return ib  # 返回墨迹 bbox 给辅助元素定位


def make_a(size, out, char="语", font_path=SONGTI, glyph_frac=0.52):
    """A 案：纯留白单字。米白底 + 中央金褐 Songti「语」。"""
    S = size * SS
    img = Image.new("RGB", (S, S), BG)

    cx, cy = S // 2, S // 2
    _paste_glyph_centered(img, char, font_path, int(S * glyph_frac), cx, cy)

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(out, "PNG")
    print("wrote", out)
    return img


def make_b(size, out, char="语", font_path=SONGTI, glyph_frac=0.46):
    """B 案：字下细金线（题跋感）。字略小，下方 1.5%px 金褐水平细线，
    长度=字宽 65%，距字底 8%S。"""
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)

    # 字上抬，给下面线留位置
    cx = S // 2
    cy = S // 2 - int(S * 0.04)
    ib = _paste_glyph_centered(img, char, font_path, int(S * glyph_frac), cx, cy)

    glyph_w = ib[2] - ib[0]
    line_len = int(glyph_w * 0.65)
    line_w = max(2, int(S * 0.015))
    line_y = cy + int(S * glyph_frac / 2) + int(S * 0.08)
    d.rectangle(
        [cx - line_len // 2, line_y,
         cx + line_len // 2, line_y + line_w],
        fill=FG,
    )

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(out, "PNG")
    print("wrote", out)
    return img


def make_c(size, out, char="语", font_path=SONGTI, glyph_frac=0.50):
    """C 案：字加金点（印章感）。字略小，右上角 4%R 金褐圆点，
    呼应 Art Daily wordmark 印章方案 B。"""
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)

    cx, cy = S // 2, S // 2
    ib = _paste_glyph_centered(img, char, font_path, int(S * glyph_frac), cx, cy)

    # 金点在字的右上方，位置以字墨迹 bbox 为准
    dot_r = max(4, int(S * 0.04))
    # 字右上角坐标
    glyph_right = cx + (ib[2] - ib[0]) // 2
    glyph_top = cy - (ib[3] - ib[1]) // 2
    dot_cx = glyph_right + int(S * 0.045)
    dot_cy = glyph_top + int(S * 0.02)
    d.ellipse(
        [dot_cx - dot_r, dot_cy - dot_r,
         dot_cx + dot_r, dot_cy + dot_r],
        fill=FG,
    )

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(out, "PNG")
    print("wrote", out)
    return img


# 最终定稿=A案
MAKERS = {"A": make_a, "B": make_b, "C": make_c}


def build_candidates():
    """三案自决：为每案生成一张 512×512 预览。"""
    root = ROOT / "sketches" / "icon-candidates"
    (root / "A-pure-white").mkdir(parents=True, exist_ok=True)
    (root / "B-tail-line").mkdir(parents=True, exist_ok=True)
    (root / "C-dot").mkdir(parents=True, exist_ok=True)
    make_a(512, root / "A-pure-white" / "preview-512.png")
    make_b(512, root / "B-tail-line" / "preview-512.png")
    make_c(512, root / "C-dot" / "preview-512.png")


def build_final(char="语", font_path=SONGTI):
    """输出最终定稿 A 案的完整尺寸族（写入 icons/）。"""
    OUT.mkdir(exist_ok=True)
    # 各尺寸主图（无框留白版，glyph_frac=0.52）
    make_a(192, OUT / "icon-192.png", char, font_path, 0.52)
    make_a(512, OUT / "icon-512.png", char, font_path, 0.52)
    # maskable：字形缩到 0.42 落入 iOS 安全圆（掩码后仍需可读，四周更宽留白）
    make_a(512, OUT / "icon-512-maskable.png", char, font_path, 0.42)
    make_a(180, OUT / "apple-touch-icon.png", char, font_path, 0.52)
    # favicon-32 / favicon.ico （小尺寸字形放大到 0.62 保可读）
    fav = make_a(32, OUT / "favicon-32.png", char, font_path, 0.62)
    fav.save(OUT / "favicon.ico", "ICO",
             sizes=[(16, 16), (32, 32)])
    print("wrote", OUT / "favicon.ico")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "candidates":
        build_candidates()
    elif len(sys.argv) > 1 and sys.argv[1] == "final":
        build_final()
    else:
        print("usage: make_icons.py [candidates|final]")
        sys.exit(1)

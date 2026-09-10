#!/usr/bin/env python3
"""生成 PWA 图标（语言学习助手，与 Art Daily 同风格系列）。

设计模板沿用 Art Daily：
- 米白大底（--bg #F5F1EA），非纯白，纸感；
- 中央金褐直角细框（--gold #8C6D3F），像装裱画框；
- 框内米白衬卡（--bg-card #FDFBF7），与框底形成极轻层次；
- 衬卡正中金褐衬线字符，按墨心 bbox 光学居中。

本脚本相对 Art Daily 的扩展：
- 支持任意字符 + 字体路径组合（三案自决用）；
- 支持"双语上下分栏"构图（C 案候选，未采用）；
- 输出：icon-192, icon-512, icon-512-maskable, apple-touch-icon(180),
        favicon-32, favicon.ico。

三案自决结果：A 案（宋体单字「语」）胜出，参数与 Art Daily 的「艺」严格一致，
仅换字符，保证「同一系列」的第一眼血脉。
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"

# 与 Art Daily 严格同色（保证系列感的第一底层）
BG = "#F5F1EA"      # 米白大底
CARD = "#FDFBF7"    # 白内衬
FG = "#8C6D3F"      # 金褐（画框 + 字形）

SS = 4  # 超采样倍数

SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
STHEITI = "/System/Library/Fonts/STHeiti Light.ttc"
BODONI_SC = "/System/Library/Fonts/Supplemental/Bodoni 72 Smallcaps Book.ttf"


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


def make(size, out, char="语", font_path=SONGTI,
         comp_frac=0.84, glyph_frac=0.72):
    """生成单个图标。

    参数与 Art Daily make_icons.py 一致（保证同系列）：
      size       输出边长像素
      comp_frac  画框外缘占画布的比例（maskable 需 ≤0.56 落入安全圆）
      glyph_frac 字形高度占内衬可绘区的比例
    """
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)

    comp = int(S * comp_frac)
    ox = (S - comp) // 2
    oy = (S - comp) // 2
    fw = max(1, int(comp * 0.010))        # 画框线宽（≈1%）
    mw = max(2, int(comp * 0.024))        # 白内衬宽度（≈2.4%）

    # 金褐直角画框
    d.rectangle([ox, oy, ox + comp - 1, oy + comp - 1],
                outline=FG, width=fw)
    # 白内衬
    mx0, my0 = ox + fw, oy + fw
    mx1, my1 = ox + comp - fw, oy + comp - fw
    d.rectangle([mx0, my0, mx1, my1], fill=CARD)

    # 字形按墨心居中于内衬可绘区
    inner = mx1 - mx0 - 2 * mw
    g, ib = _render_glyph(char, font_path, int(inner * glyph_frac))
    icx = (ib[0] + ib[2]) // 2
    icy = (ib[1] + ib[3]) // 2
    cx = (mx0 + mw + mx1 - mw) // 2
    cy = (my0 + mw + my1 - mw) // 2
    gx = cx - icx + ib[0]
    gy = cy - icy + ib[1]
    img.paste(g.crop(ib), (gx, gy))

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(out, "PNG")
    print("wrote", out)
    return img


def make_bilingual(size, out, top_char="A", top_font=BODONI_SC,
                   bot_char="语", bot_font=SONGTI,
                   comp_frac=0.84, glyph_frac=0.42):
    """双语上下分栏构图（C 案）。上英下中，中间金色细线分隔。"""
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)

    comp = int(S * comp_frac)
    ox = (S - comp) // 2
    oy = (S - comp) // 2
    fw = max(1, int(comp * 0.010))
    mw = max(2, int(comp * 0.024))

    d.rectangle([ox, oy, ox + comp - 1, oy + comp - 1],
                outline=FG, width=fw)
    mx0, my0 = ox + fw, oy + fw
    mx1, my1 = ox + comp - fw, oy + comp - fw
    d.rectangle([mx0, my0, mx1, my1], fill=CARD)

    inner_w = mx1 - mx0 - 2 * mw
    inner_h = my1 - my0 - 2 * mw
    cy_top = my0 + mw + inner_h // 4
    cy_bot = my0 + mw + 3 * inner_h // 4
    cx = (mx0 + mw + mx1 - mw) // 2

    # 中间金色分隔细线（宽度 = 内边距 60%）
    line_len = int(inner_w * 0.6)
    y_mid = my0 + mw + inner_h // 2
    d.rectangle(
        [cx - line_len // 2, y_mid - fw // 2,
         cx + line_len // 2, y_mid + max(1, fw // 2)],
        fill=FG,
    )

    # 顶部字符
    gt, ibt = _render_glyph(top_char, top_font, int(inner_h * glyph_frac))
    gx = cx - (ibt[0] + ibt[2]) // 2 + ibt[0]
    gy = cy_top - (ibt[1] + ibt[3]) // 2 + ibt[1]
    img.paste(gt.crop(ibt), (gx, gy))

    # 底部字符
    gb, ibb = _render_glyph(bot_char, bot_font, int(inner_h * glyph_frac))
    gx = cx - (ibb[0] + ibb[2]) // 2 + ibb[0]
    gy = cy_bot - (ibb[1] + ibb[3]) // 2 + ibb[1]
    img.paste(gb.crop(ibb), (gx, gy))

    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(out, "PNG")
    print("wrote", out)
    return img


def build_candidates():
    """三案自决：为每案生成一张 512×512 预览。"""
    root = ROOT / "sketches" / "icon-candidates"
    # A：宋体单字「语」，参数完全同 Art Daily
    make(512, root / "A-tongstruct" / "preview-512.png",
         char="语", font_path=SONGTI, comp_frac=0.84, glyph_frac=0.72)
    # B：Bodoni SC 大写「T」（Tutor 首字母，衬线小型大写）
    make(512, root / "B-english-T" / "preview-512.png",
         char="T", font_path=BODONI_SC, comp_frac=0.84, glyph_frac=0.75)
    # C：双语上下「A / 语」
    make_bilingual(512, root / "C-bilingual" / "preview-512.png",
                   top_char="A", top_font=BODONI_SC,
                   bot_char="语", bot_font=SONGTI,
                   comp_frac=0.84, glyph_frac=0.42)


def build_final(char="语", font_path=SONGTI):
    """输出最终定稿的完整尺寸族（写入 icons/）。"""
    OUT.mkdir(exist_ok=True)
    make(192, OUT / "icon-192.png", char, font_path, 0.84, 0.72)
    make(512, OUT / "icon-512.png", char, font_path, 0.84, 0.72)
    # maskable：画框缩到 0.55 落入安全圆，字形略大保可读
    make(512, OUT / "icon-512-maskable.png",
         char, font_path, 0.55, 0.78)
    make(180, OUT / "apple-touch-icon.png",
         char, font_path, 0.84, 0.72)
    # favicon-32 / favicon.ico
    fav = make(32, OUT / "favicon-32.png",
               char, font_path, 0.90, 0.78)
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

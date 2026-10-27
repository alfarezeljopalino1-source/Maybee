"""
maybee — logo & icon generator.

Mark: "Honey Cell"
  Grid 2x2 yang dibaca sebagai strip foto dilihat dari depan. Tiga sel
  digambar sebagai bingkai kosong (garis), satu sel solid madu — jepretan
  yang akhirnya kamu simpan. Sengaja bukan lensa/aperture: itu klise semua
  aplikasi kamera.

  Satu konstruksi, dua colorway:
    - di atas krem  -> sel bergaris tinta, sel madu solid
    - di atas tinta -> sel bergaris krem, sel madu solid  (favicon & app icon)

Geometri (viewBox 36):
  sel luar 14, gap 4, mulai 2  -> 2..16 dan 20..34
  stroke 2.5  -> rect inset 1.25, lebar 11.5, radius 3
  sel madu: solid 14, radius 3, tanpa stroke (bobot optis sama dgn sel bergaris)

Jalankan:  python scripts/generate_logo.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

INK = "#1C1917"
CREAM = "#FBF9F5"
HONEY = "#FBBF24"

SUPERSAMPLE = 8

# --- geometri, satu sumber kebenaran ---------------------------------------
VIEW = 36
CELL = 14
GAP = 4
ORIGIN = 2
STROKE = 2.2
RADIUS = 3.2

COL1 = ORIGIN
COL2 = ORIGIN + CELL + GAP  # 20

# sel yang digambar sebagai bingkai kosong (kiri-atas, kanan-atas, kiri-bawah)
OUTLINE_CELLS = [(COL1, COL1), (COL2, COL1), (COL1, COL2)]
# sel madu (kanan-bawah)
HONEY_CELL = (COL2, COL2)


def _rect_svg(x: float, y: float, w: float, h: float, r: float, fill: str, stroke: str | None, sw: float) -> str:
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"'
    s += f' fill="{fill}"'
    if stroke:
        s += f' stroke="{stroke}" stroke-width="{sw}"'
    return s + " />"


def mark_svg(ink: str, honey: str) -> str:
    """Isi mark saja (tanpa <svg> pembungkus)."""
    parts = []
    inset = STROKE / 2
    inner = CELL - STROKE
    for (x, y) in OUTLINE_CELLS:
        parts.append(_rect_svg(x + inset, y + inset, inner, inner, RADIUS, "none", ink, STROKE))
    hx, hy = HONEY_CELL
    parts.append(_rect_svg(hx, hy, CELL, CELL, RADIUS, honey, None, 0))
    return "".join(parts)


def standalone_mark_svg() -> str:
    """Mark transparan untuk dipakai di UI (currentColor-friendly)."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW} {VIEW}" role="img" aria-label="maybee">\n'
        f"  {mark_svg(INK, HONEY)}\n"
        "</svg>\n"
    )


def favicon_svg() -> str:
    """Plat tinta penuh — biar kebaca di tab bar terang maupun gelap."""
    plate = _rect_svg(0, 0, VIEW, VIEW, 9, INK, None, 0)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW} {VIEW}" role="img" aria-label="maybee">\n'
        f"  {plate}\n"
        f"  {mark_svg(CREAM, HONEY)}\n"
        "</svg>\n"
    )


def draw_mark_solid(draw: ImageDraw.ImageDraw, ox: int, oy: int, ink: str, honey: str, scale: float) -> None:
    """Varian optik untuk ukuran kecil (<= 64px).

    Sel bergaris selalu jadi abu-abu keruh begitu downscale: stroke 1px
    antialiased di atas plat gelap kehilangan kontras. Sel solid bertahan.
    """
    for (x, y) in OUTLINE_CELLS:
        x0, y0 = ox + x * scale, oy + y * scale
        draw.rounded_rectangle(
            [x0, y0, x0 + CELL * scale, y0 + CELL * scale],
            radius=RADIUS * scale * 1.1,
            fill=ink,
        )
    hx, hy = HONEY_CELL
    x0, y0 = ox + hx * scale, oy + hy * scale
    draw.rounded_rectangle(
        [x0, y0, x0 + CELL * scale, y0 + CELL * scale],
        radius=RADIUS * scale * 1.1,
        fill=honey,
    )


def draw_mark(draw: ImageDraw.ImageDraw, size: int, ox: int, oy: int, ink: str, honey: str, scale: float) -> None:
    """Gambar mark ke kanvas raster. scale = piksel per unit viewBox."""
    def px(v: float) -> float:
        return v * scale

    inset = STROKE / 2
    inner = CELL - STROKE
    for (x, y) in OUTLINE_CELLS:
        x0, y0 = ox + px(x + inset), oy + px(y + inset)
        draw.rounded_rectangle(
            [x0, y0, x0 + px(inner), y0 + px(inner)],
            radius=px(RADIUS),
            outline=ink,
            width=max(1, round(px(STROKE))),
        )
    hx, hy = HONEY_CELL
    x0, y0 = ox + px(hx), oy + px(hy)
    draw.rounded_rectangle(
        [x0, y0, x0 + px(CELL), y0 + px(CELL)],
        radius=px(RADIUS),
        fill=honey,
    )


def render_icon(size: int, *, plate: bool, radius_ratio: float = 0.0, pad_ratio: float = 0.0, solid: bool = False) -> Image.Image:
    """
    plate=True  -> plat tinta penuh (favicon / app icon)
    plate=False -> mark transparan
    pad_ratio   -> margin dalam, dipakai buat safe zone maskable
    """
    hi = size * SUPERSAMPLE
    img = Image.new("RGBA", (hi, hi), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if plate:
        r = int(hi * radius_ratio)
        draw.rounded_rectangle([0, 0, hi - 1, hi - 1], radius=r, fill=INK)
        ink, honey = CREAM, HONEY
    else:
        ink, honey = INK, HONEY

    pad = hi * pad_ratio
    inner = hi - pad * 2
    scale = inner / VIEW
    if solid:
        draw_mark_solid(draw, int(pad), int(pad), ink, honey, scale)
    else:
        draw_mark(draw, size, int(pad), int(pad), ink, honey, scale)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)

    (PUBLIC / "logo-mark.svg").write_text(standalone_mark_svg(), encoding="utf-8")
    (PUBLIC / "favicon.svg").write_text(favicon_svg(), encoding="utf-8")

    outputs = [
        ("favicon-32.png", render_icon(32, plate=True, radius_ratio=0.22, solid=True)),
        ("icon-192.png", render_icon(192, plate=True, radius_ratio=0.22, solid=True)),
        ("icon-512.png", render_icon(512, plate=True, radius_ratio=0.22, solid=True)),
        ("icon-maskable-512.png", render_icon(512, plate=True, radius_ratio=0.0, pad_ratio=0.14, solid=True)),
        # iOS nggak suka sudut transparan — plat penuh, sudutnya dipotong OS.
        ("apple-touch-icon.png", render_icon(180, plate=True, radius_ratio=0.0, solid=True)),
        ("logo-mark-512.png", render_icon(512, plate=False)),
    ]

    for name, img in outputs:
        path = PUBLIC / name
        img.save(path, optimize=True)
        print(f"logo  {name:26s} {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()

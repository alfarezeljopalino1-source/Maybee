"""
maybee — frame & sample asset generator.

Sumber kebenaran untuk katalog bingkai. Menghasilkan:
  public/frames/*.png   -> overlay PNG transparan (lubang slot 100% transparan)
  public/samples/*.jpg  -> foto contoh untuk mockup & uji engine tanpa kamera
  src/data/frames.json  -> katalog yang dibaca aplikasi (koordinat slot, dst)

Jalankan:  python scripts/generate_assets.py
"""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FRAMES_DIR = ROOT / "public" / "frames"
SAMPLES_DIR = ROOT / "public" / "samples"
DATA_FILE = ROOT / "src" / "data" / "frames.json"

FONT_CANDIDATES = {
    "serif": ["C:/Windows/Fonts/georgia.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"],
    "serif_italic": ["C:/Windows/Fonts/georgiai.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"],
    "mono": ["C:/Windows/Fonts/consola.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"],
    "sans": ["C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"],
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES[kind]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def hexrgb(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def tracked_width(draw: ImageDraw.ImageDraw, text: str, fnt, tracking: float) -> float:
    return sum(draw.textlength(ch, font=fnt) for ch in text) + tracking * max(0, len(text) - 1)


def draw_tracked(draw, pos, text, fnt, fill, tracking=0.0, anchor="la"):
    """Teks dengan letter-spacing manual (PIL nggak punya tracking).

    Anchor cuma dua sumbu: 'l'/'m'/'r' buat horizontal. Sebelumnya 'ra'
    diabaikan, jadi wordmark polaroid digambar mulai x=1100 dan kepotong
    keluar kanvas — kebaca 'mayb'.
    """
    x, y = pos
    width = tracked_width(draw, text, fnt, tracking)
    if anchor.startswith("m"):
        x -= width / 2
    elif anchor.startswith("r"):
        x -= width
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking


def speckle(img: Image.Image, density: float = 0.0011, seed: int = 7) -> None:
    """Butiran kertas halus — bikin overlay kerasa kayak kertas foto, bukan digital kosong."""
    rnd = random.Random(seed)
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    count = int(w * h * density)
    for _ in range(count):
        x = rnd.randrange(w)
        y = rnd.randrange(h)
        r = rnd.choice([0, 0, 0, 1, 1, 2])
        a = rnd.randint(6, 20)
        tone = rnd.choice([(90, 74, 52), (255, 252, 244), (60, 50, 40)])
        d.ellipse((x - r, y - r, x + r, y + r), fill=(*tone, a))
    img.alpha_composite(layer)


def punch_slots(img: Image.Image, slots: list[dict]) -> None:
    mask = Image.new("L", img.size, 255)
    d = ImageDraw.Draw(mask)
    for s in slots:
        box = (s["x"], s["y"], s["x"] + s["width"], s["y"] + s["height"])
        radius = s.get("radius", 0)
        if radius:
            d.rounded_rectangle(box, radius=radius, fill=0)
        else:
            d.rectangle(box, fill=0)
    # mask 255 = pertahankan alpha, mask 0 (area slot) = tembus pandang total
    img.putalpha(Image.composite(img.getchannel("A"), Image.new("L", img.size, 0), mask))


def slot_hairlines(deco: ImageDraw.ImageDraw, slots: list[dict], color, width=3, inset=-2):
    for s in slots:
        box = (
            s["x"] - inset,
            s["y"] - inset,
            s["x"] + s["width"] + inset,
            s["y"] + s["height"] + inset,
        )
        radius = s.get("radius", 0)
        if radius:
            deco.rounded_rectangle(box, radius=radius, outline=color, width=width)
        else:
            deco.rectangle(box, outline=color, width=width)


# ---------------------------------------------------------------------------
# Katalog
# ---------------------------------------------------------------------------

def strip_slots() -> list[dict]:
    # 4 slot @740 + 3 jeda @40 = 3080, berakhir di y=3260.
    # Nyisain 74px ke garis caption (3334) — sebelumnya cuma 4px, garisnya
    # nempel banget ke foto terakhir kayak noda.
    return [
        {"index": i + 1, "x": 100, "y": 180 + i * 780, "width": 1000, "height": 740, "radius": 0}
        for i in range(4)
    ]


def trio_slots() -> list[dict]:
    return [
        {"index": i + 1, "x": 100, "y": 200 + i * 820, "width": 1000, "height": 780, "radius": 0}
        for i in range(3)
    ]


FRAMES: list[dict] = [
    {
        "id": "honey-classic",
        "title": "Honey Classic",
        "tagline": "Empat potret, satu kertas madu.",
        "type": "strip",
        "akses": "bebas",
        "categoryLabel": "Classic 4-Cut",
        "canvasWidth": 1200,
        "canvasHeight": 3600,
        "defaultBgColor": "#FBF6EC",
        "accentColor": "#E0AE4E",
        "inkColor": "#2A241E",
        "slots": strip_slots(),
        "captionBox": {"x": 100, "y": 3360, "width": 1000, "height": 140, "align": "left"},
        "render": {
            "style": "strip",
            "paper": "#FBF6EC",
            "ink": "#2A241E",
            "accent": "#D9A441",
            "wordmark": "maybee",
            "kicker": "SWEET MEMORIES, ONE STRIP AT A TIME",
        },
    },
    {
        "id": "midnight-seoul",
        "title": "Midnight Seoul",
        "tagline": "Hitam pekat ala bilik foto Seoul.",
        "type": "strip",
        "akses": "bebas",
        "categoryLabel": "Classic 4-Cut",
        "canvasWidth": 1200,
        "canvasHeight": 3600,
        "defaultBgColor": "#17130F",
        "accentColor": "#E8C27A",
        "inkColor": "#F4EADA",
        "slots": strip_slots(),
        "captionBox": {"x": 100, "y": 3360, "width": 1000, "height": 140, "align": "left"},
        "render": {
            "style": "strip",
            "paper": "#17130F",
            "ink": "#F4EADA",
            "accent": "#C8A25C",
            "wordmark": "maybee",
            "kicker": "SEOUL, KR — 04 FRAMES",
        },
    },
    {
        "id": "sage-morning",
        "title": "Sage Morning",
        "tagline": "Hijau tenang buat pagi yang pelan.",
        "type": "strip",
        "akses": "bebas",
        "categoryLabel": "Classic 4-Cut",
        "canvasWidth": 1200,
        "canvasHeight": 3600,
        "defaultBgColor": "#EAEDE2",
        "accentColor": "#8FA37F",
        "inkColor": "#2B3226",
        "slots": strip_slots(),
        "captionBox": {"x": 100, "y": 3360, "width": 1000, "height": 140, "align": "left"},
        "render": {
            "style": "strip",
            "paper": "#EAEDE2",
            "ink": "#2B3226",
            "accent": "#7E9470",
            "wordmark": "maybee",
            "kicker": "SLOW MORNING, SOFT LIGHT",
        },
    },
    {
        "id": "honey-trio",
        "title": "Honey Trio",
        "tagline": "Tiga pose, ruang napas lebih lega.",
        "type": "strip",
        "akses": "bebas",
        "categoryLabel": "Classic 3-Cut",
        "canvasWidth": 1200,
        "canvasHeight": 3000,
        "defaultBgColor": "#FBF6EC",
        "accentColor": "#E0AE4E",
        "inkColor": "#2A241E",
        "slots": trio_slots(),
        "captionBox": {"x": 100, "y": 2720, "width": 1000, "height": 150, "align": "left"},
        "render": {
            "style": "strip",
            "paper": "#F6EEDF",
            "ink": "#2A241E",
            "accent": "#D9A441",
            "wordmark": "maybee",
            "kicker": "THREE POSES, ONE GOOD MORNING",
        },
    },
    {
        "id": "butter-grid",
        "title": "Butter Grid",
        "tagline": "Empat jepretan jadi satu lembar 4R.",
        "type": "grid",
        "akses": "bebas",
        "categoryLabel": "2x2 Grid",
        "canvasWidth": 2400,
        "canvasHeight": 3000,
        "defaultBgColor": "#FDF6E4",
        "accentColor": "#D9A441",
        "inkColor": "#2A241E",
        "slots": [
            {"index": 1, "x": 160, "y": 180, "width": 1000, "height": 1000, "radius": 8},
            {"index": 2, "x": 1240, "y": 180, "width": 1000, "height": 1000, "radius": 8},
            {"index": 3, "x": 160, "y": 1260, "width": 1000, "height": 1000, "radius": 8},
            {"index": 4, "x": 1240, "y": 1260, "width": 1000, "height": 1000, "radius": 8},
        ],
        "captionBox": {"x": 160, "y": 2340, "width": 2080, "height": 160, "align": "left"},
        "render": {
            "style": "grid",
            "paper": "#FDF6E4",
            "ink": "#2A241E",
            "accent": "#D9A441",
            "wordmark": "maybee",
            "kicker": "BUTTER GRID / 4R PRINT",
        },
    },
    {
        "id": "polaroid-duo",
        "title": "Polaroid Duo",
        "tagline": "Dua bingkai lebar, margin tebal.",
        "type": "polaroid",
        "akses": "bebas",
        "categoryLabel": "Polaroid / Wide",
        "canvasWidth": 1200,
        "canvasHeight": 1800,
        "defaultBgColor": "#FFFDF8",
        "accentColor": "#C9A227",
        "inkColor": "#2A241E",
        "slots": [
            {"index": 1, "x": 100, "y": 110, "width": 1000, "height": 660, "radius": 0},
            {"index": 2, "x": 100, "y": 810, "width": 1000, "height": 660, "radius": 0},
        ],
        "captionBox": {"x": 100, "y": 1556, "width": 720, "height": 150, "align": "left"},
        "render": {
            "style": "polaroid",
            "paper": "#FFFDF8",
            "ink": "#2A241E",
            "accent": "#C9A227",
            "wordmark": "maybee",
            "kicker": "POLAROID DUO",
        },
    },
    {
        "id": "linen-arch",
        "title": "Linen Arch",
        "tagline": "Serat kain, cahaya sore, satu strip.",
        "type": "strip",
        "akses": "koleksi",
        "categoryLabel": "Classic 4-Cut",
        "canvasWidth": 1200,
        "canvasHeight": 3600,
        "defaultBgColor": "#EFE9DE",
        "accentColor": "#A8724A",
        "inkColor": "#3A3227",
        "slots": strip_slots(),
        "captionBox": {"x": 100, "y": 3360, "width": 1000, "height": 140, "align": "left"},
        "render": {
            "style": "strip",
            "paper": "#EFE9DE",
            "ink": "#3A3227",
            "accent": "#A8724A",
            "wordmark": "maybee",
            "kicker": "LINEN LIGHT, SLOW AFTERNOON",
            "premium": True,
        },
    },
    {
        "id": "amber-grid",
        "title": "Amber Room",
        "tagline": "Empat potret di ruang amber, cetak 4R.",
        "type": "grid",
        "akses": "koleksi",
        "categoryLabel": "2x2 Grid",
        "canvasWidth": 2400,
        "canvasHeight": 3000,
        "defaultBgColor": "#F3E3C9",
        "accentColor": "#B4763A",
        "inkColor": "#2E2317",
        "slots": [
            {"index": 1, "x": 160, "y": 180, "width": 1000, "height": 1000, "radius": 8},
            {"index": 2, "x": 1240, "y": 180, "width": 1000, "height": 1000, "radius": 8},
            {"index": 3, "x": 160, "y": 1260, "width": 1000, "height": 1000, "radius": 8},
            {"index": 4, "x": 1240, "y": 1260, "width": 1000, "height": 1000, "radius": 8},
        ],
        "captionBox": {"x": 160, "y": 2340, "width": 2080, "height": 160, "align": "left"},
        "render": {
            "style": "grid",
            "paper": "#F3E3C9",
            "ink": "#2E2317",
            "accent": "#B4763A",
            "wordmark": "maybee",
            "kicker": "AMBER ROOM / 4R PRINT",
            "premium": True,
        },
    },
]


# ---------------------------------------------------------------------------
# Render per gaya
# ---------------------------------------------------------------------------

def render_frame(spec: dict) -> Image.Image:
    W, H = spec["canvasWidth"], spec["canvasHeight"]
    r = spec["render"]
    ink = hexrgb(r["ink"])
    accent = hexrgb(r["accent"])
    muted = (*ink[:3], 150)

    # Kertas sengaja TRANSPARAN: warna kertas diisi composer dari state
    # "KERTAS" di UI (biar swatch beneran ngefek). Overlay cuma bawa tinta,
    # garis, dan butiran film.
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    speckle(img, density=0.0011 if W > 1500 else 0.0015, seed=hash(spec["id"]) % 999)

    style = r["style"]
    deco = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(deco)
    tracked = {
        "kicker": 2.0,
        "footer": 2.5,
    }

    if style == "strip":
        top = 180
        bottom = H - (spec["slots"][-1]["y"] + spec["slots"][-1]["height"])
        f_word = font("serif", 96)
        f_kick = font("mono", 24)
        f_foot = font("mono", 21)

        # Georgia 96: descender 'y' jatuh 110px dari y-teks, jadi kicker
        # digeser ke 146 supaya nggak ketabrak ekor huruf.
        draw_tracked(d, (W / 2, 24), r["wordmark"], f_word, ink, tracking=1.5, anchor="ma")
        draw_tracked(d, (W / 2, 146), r["kicker"], f_kick, muted, tracking=tracked["kicker"], anchor="ma")

        # garis tipis + tick sudut
        inset = 46
        d.rectangle((inset, inset, W - inset, H - inset), outline=(*ink[:3], 28), width=2)
        for cx, cy, dx, dy in [
            (inset, inset, 1, 1),
            (W - inset, inset, -1, 1),
            (inset, H - inset, 1, -1),
            (W - inset, H - inset, -1, -1),
        ]:
            d.line((cx, cy, cx + 26 * dx, cy), fill=(*ink[:3], 90), width=3)
            d.line((cx, cy, cx, cy + 26 * dy), fill=(*ink[:3], 90), width=3)

        # pemisah area caption
        cap_y = spec["captionBox"]["y"]
        d.line((100, cap_y - 26, 1064, cap_y - 26), fill=(*ink[:3], 46), width=2)
        d.ellipse((1062, cap_y - 32, 1074, cap_y - 20), fill=accent)

        draw_tracked(d, (100, H - 64), "MAYBEE STUDIO", f_foot, muted, tracking=tracked["footer"])
        label = f"{W} × {H}"
        draw_tracked(d, (1100 - tracked_width(d, label, f_foot, tracked["footer"]), H - 62),
                     label, f_foot, muted, tracking=tracked["footer"])

    elif style == "grid":
        f_word = font("serif", 96)
        f_kick = font("mono", 24)
        f_giant = font("serif", 250)
        cap_y = spec["captionBox"]["y"]

        # y=56: descender 'y' berhenti di 166, di atas tepi slot (180).
        draw_tracked(d, (160, 56), r["wordmark"], f_word, ink, tracking=1.0)
        label = r["kicker"]
        draw_tracked(d, (2240 - tracked_width(d, label, f_kick, 3.0), 126), label, f_kick, muted, tracking=3.0)

        d.rectangle((44, 44, W - 44, H - 44), outline=(*ink[:3], 26), width=2)
        d.line((160, cap_y - 40, 2214, cap_y - 40), fill=(*ink[:3], 46), width=2)
        d.ellipse((2212, cap_y - 48, 2228, cap_y - 32), fill=accent)

        # Watermark raksasa: 250px turun 284px dari y-teks, jadi ditaruh
        # di 2600 (berhenti 2884) dan meta digeser ke 2916 — sebelumnya
        # keduanya tabrakan di 2936-2944.
        draw_tracked(d, (W / 2, 2600), r["wordmark"], f_giant, (*ink[:3], 26), tracking=2.0, anchor="ma")
        f_meta = font("mono", 22)
        meta = "PHOTOBOX · 300 DPI · PRINT READY"
        draw_tracked(d, (W / 2, 2916), meta, f_meta, muted, tracking=3.2, anchor="ma")

    elif style == "polaroid":
        f_brand = font("serif", 48)
        f_mono = font("mono", 18)

        # margin tebal ala polaroid: hairline tipis di tepi luar
        d.rectangle((30, 30, W - 30, H - 30), outline=(*ink[:3], 20), width=2)
        draw_tracked(d, (1100, 1672), r["wordmark"], f_brand, ink, tracking=0.5, anchor="ra")
        d.ellipse((1100 - tracked_width(d, r["wordmark"], f_brand, 0.5) - 16, 1694,
                   1100 - tracked_width(d, r["wordmark"], f_brand, 0.5) - 6, 1704), fill=accent)
        # y=1740: descender mono 18 jatuh di 1754, masih di atas hairline (1770).
        draw_tracked(d, (100, 1740), "MAYBEE PHOTOBOX — POLAROID DUO", f_mono, muted, tracking=2.4)

    if r.get("premium"):
        # Bingkai ganda + berlian sudut. Bukan hiasan acak: dua garis tipis
        # adalah bahasa cetak (paspartout), dan berlian menandai bahwa bingkai
        # ini bagian dari Koleksi — bukan gradien, bukan glow.
        m = 26
        d.rectangle((m, m, W - m, H - m), outline=(*ink[:3], 26), width=1)
        d.rectangle((m + 9, m + 9, W - m - 9, H - m - 9), outline=(*ink[:3], 16), width=1)
        dm = 7
        for cx, cy in [(m, m), (W - m, m), (m, H - m), (W - m, H - m)]:
            d.polygon([(cx, cy - dm), (cx + dm, cy), (cx, cy + dm), (cx - dm, cy)], fill=accent)

    # lubang slot SETELAH tekstur, SEBELUM dekorasi
    punch_slots(img, spec["slots"])
    slot_hairlines(d, spec["slots"], (*ink[:3], 70), width=3, inset=-3)
    img.alpha_composite(deco)
    return img


# ---------------------------------------------------------------------------
# Foto contoh (abstrak, hangat, tanpa wajah)
# ---------------------------------------------------------------------------

def vgrad(size, top: str, bottom: str) -> Image.Image:
    W, H = size
    top_rgb, bot_rgb = hexrgb(top)[:3], hexrgb(bottom)[:3]
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(1, H - 1)
        c = tuple(int(top_rgb[i] + (bot_rgb[i] - top_rgb[i]) * t) for i in range(3))
        d.line((0, y, W, y), fill=c)
    return img


def add_finish(img: Image.Image, grain: float = 0.055) -> Image.Image:
    noise = Image.effect_noise(img.size, 22).convert("RGB")
    img = Image.blend(img, noise, grain)
    return img


def shape_layer(size, draw_fn) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer), size)
    return layer


def make_samples() -> None:
    W = H = 1000
    random.seed(11)

    # 1. sun — gradasi senja + matahari lembut
    img = vgrad((W, H), "#F7E4C4", "#E5A16B")
    glow = shape_layer((W, H), lambda d, s: d.ellipse((470, 150, 830, 510), fill=(255, 226, 160, 255)))
    img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(46))).convert("RGB")
    band = shape_layer((W, H), lambda d, s: d.rectangle((0, 690, W, H), fill=(176, 118, 84, 210)))
    band = band.filter(ImageFilter.GaussianBlur(24))
    img = Image.alpha_composite(img.convert("RGBA"), band).convert("RGB")
    add_finish(img).save(SAMPLES_DIR / "pose-1.jpg", quality=90)

    # 2. arch — lengkungan terakota di atas oat
    img = vgrad((W, H), "#F3EAD9", "#E9DDC8")
    arch = shape_layer((W, H), lambda d, s: d.rounded_rectangle((250, 250, 750, 790), radius=250, fill=(190, 112, 82, 255)))
    arch = arch.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img.convert("RGBA"), arch).convert("RGB")
    shadow = shape_layer((W, H), lambda d, s: d.ellipse((250, 760, 760, 860), fill=(120, 80, 60, 90)))
    img = Image.alpha_composite(img.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(30))).convert("RGB")
    add_finish(img).save(SAMPLES_DIR / "pose-2.jpg", quality=90)

    # 3. still — vas & buah, siluet lembut
    img = vgrad((W, H), "#EFE7D8", "#DFD2BC")
    table = shape_layer((W, H), lambda d, s: d.rectangle((0, 720, W, H), fill=(168, 132, 96, 255)))
    img = Image.alpha_composite(img.convert("RGBA"), table).convert("RGB")
    vase = shape_layer((W, H), lambda d, s: d.ellipse((330, 430, 570, 750), fill=(176, 106, 84, 255)))
    pear = shape_layer((W, H), lambda d, s: d.ellipse((600, 560, 770, 740), fill=(211, 160, 71, 255)))
    img = Image.alpha_composite(img.convert("RGBA"), vase).convert("RGB")
    img = Image.alpha_composite(img.convert("RGBA"), pear).convert("RGB")
    shadow = shape_layer((W, H), lambda d, s: d.ellipse((300, 700, 800, 790), fill=(90, 60, 45, 110)))
    img = Image.alpha_composite(img.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(26))).convert("RGB")
    add_finish(img).save(SAMPLES_DIR / "pose-3.jpg", quality=90)

    # 4. leaf — bayangan daun di dinding krem
    img = vgrad((W, H), "#F8F2E7", "#EFE4D2")
    leaves = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaves)
    for i in range(9):
        cx = random.randint(120, 880)
        cy = random.randint(150, 800)
        rx = random.randint(60, 130)
        ry = random.randint(22, 48)
        ang = random.randint(-60, 60)
        leaf = Image.new("RGBA", (rx * 2, ry * 2), (0, 0, 0, 0))
        ImageDraw.Draw(leaf).ellipse((0, 0, rx * 2, ry * 2), fill=(124, 106, 78, 70))
        leaf = leaf.rotate(ang, expand=True)
        leaves.alpha_composite(leaf, (max(0, cx - rx), max(0, cy - ry)))
    img = Image.alpha_composite(img.convert("RGBA"), leaves.filter(ImageFilter.GaussianBlur(9))).convert("RGB")
    add_finish(img).save(SAMPLES_DIR / "pose-4.jpg", quality=90)

    # 5. sea — laut tenang, horizon tipis
    img = vgrad((W, H), "#E4E7DF", "#A9BAB4")
    sea = shape_layer((W, H), lambda d, s: d.rectangle((0, 560, W, H), fill=(126, 154, 150, 255)))
    img = Image.alpha_composite(img.convert("RGBA"), sea).convert("RGB")
    sun = shape_layer((W, H), lambda d, s: d.ellipse((650, 300, 820, 470), fill=(255, 246, 214, 160)))
    img = Image.alpha_composite(img.convert("RGBA"), sun.filter(ImageFilter.GaussianBlur(34))).convert("RGB")
    add_finish(img).save(SAMPLES_DIR / "pose-5.jpg", quality=90)

    # 6. bloom — bokeh hangat
    img = vgrad((W, H), "#FDF1D6", "#F0CE9B")
    bokeh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bokeh)
    for _ in range(14):
        r = random.randint(40, 130)
        x = random.randint(-40, W)
        y = random.randint(-40, H)
        tone = random.choice([(247, 196, 111), (229, 160, 104), (255, 228, 168)])
        bd.ellipse((x, y, x + r * 2, y + r * 2), fill=(*tone, random.randint(60, 130)))
    img = Image.alpha_composite(img.convert("RGBA"), bokeh.filter(ImageFilter.GaussianBlur(20))).convert("RGB")
    add_finish(img, 0.045).save(SAMPLES_DIR / "pose-6.jpg", quality=90)


def validate(spec: dict) -> None:
    """Jaga geometri bingkai: slot nggak boleh keluar kanvas, saling tumpuk,
    atau mepet garis caption. Bug jenis ini nggak kelihatan di JSON — cuma
    ketahuan pas hasil cetak keluar, jadi lebih baik gagal di sini."""
    W, H = spec["canvasWidth"], spec["canvasHeight"]
    slots = spec["slots"]
    issues: list[str] = []

    for s in slots:
        if s["x"] < 0 or s["y"] < 0 or s["x"] + s["width"] > W or s["y"] + s["height"] > H:
            issues.append(f"slot {s['index']} keluar kanvas")

    boxes = [(s["x"], s["y"], s["x"] + s["width"], s["y"] + s["height"]) for s in slots]
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            ax1, ay1, ax2, ay2 = boxes[i]
            bx1, by1, bx2, by2 = boxes[j]
            if ax1 < bx2 and bx1 < ax2 and ay1 < by2 and by1 < ay2:
                issues.append(f"slot {i + 1} & {j + 1} tumpuk")

    cap = spec["captionBox"]
    divider = cap["y"] - 26
    last_bottom = max(b["y"] + b["height"] for b in slots)
    clear = divider - last_bottom
    # garis caption harus di bawah foto terakhir, dengan napas minimal
    min_clear = 24
    if clear < min_clear:
        issues.append(f"jarak garis caption cuma {clear}px (min {min_clear}px)")

    if cap["x"] + cap["width"] > W or cap["y"] + cap["height"] > H:
        issues.append("captionBox keluar kanvas")

    if issues:
        raise SystemExit(f"[geometri] {spec['id']}: " + "; ".join(issues))


def main() -> None:
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    catalog = []
    for spec in FRAMES:
        validate(spec)
        img = render_frame(spec)
        out = FRAMES_DIR / f"{spec['id']}.png"
        img.save(out, optimize=True)
        entry = {k: v for k, v in spec.items() if k != "render"}
        entry["overlayUrl"] = f"/frames/{spec['id']}.png"
        entry["photoCount"] = len(spec["slots"])
        catalog.append(entry)
        print(f"frame  {out.name:28s} {img.size[0]}x{img.size[1]}  {out.stat().st_size // 1024} KB")

    make_samples()
    for p in sorted(SAMPLES_DIR.glob("*.jpg")):
        print(f"sample {p.name:28s} {p.stat().st_size // 1024} KB")

    DATA_FILE.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"catalog -> {DATA_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

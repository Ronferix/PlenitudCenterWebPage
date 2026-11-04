# Make the light copies of every photo the pages actually serve.
#   python tools/optimize-images.py
# media/<name>.jpg (the 1200px original) -> media/w/<name>-480.webp, -800.webp, -1200.webp
# build.mjs points each <img> at them through srcset; the JPG stays as the fallback src.
# Re-run after adding or replacing a photo in media/.
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, 'media'), os.path.join(ROOT, 'media', 'w')
WIDTHS = (480, 800, 1200)
os.makedirs(OUT, exist_ok=True)

before = after = 0
for name in sorted(os.listdir(SRC)):
    if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    stem = os.path.splitext(name)[0]
    im = Image.open(os.path.join(SRC, name)).convert('RGB')
    before += os.path.getsize(os.path.join(SRC, name))
    for w in WIDTHS:
        if w > im.width:
            continue
        h = round(im.height * w / im.width)
        dest = os.path.join(OUT, f'{stem}-{w}.webp')
        im.resize((w, h), Image.LANCZOS).save(dest, 'WEBP', quality=76, method=6)
        if w == 800:
            after += os.path.getsize(dest)

# The logo emblem is drawn at 32-96px; a 192px copy covers 2x screens.
logo = os.path.join(ROOT, 'design-system', 'assets', 'logo-emblem.png')
small = os.path.join(ROOT, 'design-system', 'assets', 'logo-emblem-192.png')
Image.open(logo).resize((192, 192), Image.LANCZOS).save(small, optimize=True)

print(f'originals {before // 1024} KB -> 800px WebP set {after // 1024} KB; logo {os.path.getsize(logo) // 1024} KB -> {os.path.getsize(small) // 1024} KB')

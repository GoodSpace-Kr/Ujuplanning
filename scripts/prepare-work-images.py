"""Prepare small, versioned portfolio images from the supplied project assets."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
destination = root / 'public/assets/work'
destination.mkdir(parents=True, exist_ok=True)
sources = {
    'chungho': 'project-chungho.png',
    'bavarian': 'project-bavarian.png',
    'ocean': 'project-ocean.png',
    'ohrun': 'ohrun-retouch.jpg',
    'byd': 'project-byd.png',
}
manifest = {}
for slug, source in sources.items():
    original = ImageOps.exif_transpose(Image.open(root / 'public' / source)).convert('RGB')
    variants = []
    for limit in [480, 1280]:
        image = original.copy()
        image.thumbnail((limit, 1600), Image.Resampling.LANCZOS)
        temporary = destination / f'{slug}.webp'
        image.save(temporary, 'WEBP', quality=82, method=6, icc_profile=original.info.get('icc_profile'))
        data = temporary.read_bytes()
        name = f'{slug}-{image.width}-{hashlib.sha256(data).hexdigest()[:12]}.webp'
        temporary.rename(destination / name)
        variants.append({'src': f'/assets/work/{name}', 'width': image.width, 'height': image.height, 'bytes': len(data)})
    manifest[slug] = variants
(root / 'lib/work-images.generated.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'{sum(v["bytes"] for variants in manifest.values() for v in variants):,} bytes across {len(sources) * 2} images')

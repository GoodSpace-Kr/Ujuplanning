"""Offline preparation; keep source artwork and audio intact. Requires Pillow."""
from pathlib import Path
from PIL import Image
import hashlib
import io
import json
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent.parent
output = root / 'public/assets/service-media'
output.mkdir(parents=True, exist_ok=True)
manifest = {'images': {}}
for source in ['mini-campaign-grid.png', 'cardnews/bmw-color-lineup.jpg', 'cardnews/bmw-golf-cup.jpg', 'cardnews/bmw-march-promotion.jpg']:
    image = Image.open(root / 'public' / source)
    buffer = io.BytesIO()
    image.save(buffer, 'WEBP', quality=87, method=6, icc_profile=image.info.get('icc_profile', b''))
    data = buffer.getvalue()
    name = f'{Path(source).stem}-{hashlib.sha256(data).hexdigest()[:12]}.webp'
    (output / name).write_bytes(data)
    manifest['images'][source] = f'/assets/service-media/{name}'
    print(name, len(data), flush=True)
with tempfile.TemporaryDirectory() as temporary:
    path = Path(temporary) / 'ohrun.mp4'
    subprocess.run([sys.argv[1], '-hide_banner', '-loglevel', 'error', '-y', '-i', str(root / 'public/ohrun.mp4'),
                    '-vf', 'scale=960:-2:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
                    '-g', '48', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(path)], check=True)
    data = path.read_bytes()
name = f'ohrun-{hashlib.sha256(data).hexdigest()[:12]}.mp4'
(output / name).write_bytes(data)
manifest['video'] = {'src': f'/assets/service-media/{name}', 'bytes': len(data)}
print(name, len(data), flush=True)
(root / 'lib/service-media.generated.json').write_text(json.dumps(manifest, indent=2) + '\n')

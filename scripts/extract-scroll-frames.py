"""Extract a video to numbered desktop/mobile WebP stills; requires FFmpeg and Pillow.

Usage: python3 scripts/extract-scroll-frames.py INPUT OUTPUT [--ffmpeg /path/to/ffmpeg]
The original frame rate and every frame are retained. The source video is not published.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from fractions import Fraction
import json
from pathlib import Path
import subprocess
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
probe = str(Path(args.ffmpeg).with_name('ffprobe'))
info = json.loads(subprocess.check_output([probe, '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate:format=duration', '-of', 'json', str(args.input)]))
stream = info['streams'][0]
width, height = stream['width'], stream['height']
for variant in ('desktop', 'mobile'):
    (args.output / variant).mkdir(parents=True, exist_ok=True)

def encode(index, pixels):
    image = Image.frombytes('RGB', (width, height), pixels)
    image.save(args.output / 'desktop' / f'{index:04d}.webp', quality=82, method=4)
    mobile_height = round(height * 960 / width)
    image.resize((960, mobile_height), Image.Resampling.LANCZOS).save(
        args.output / 'mobile' / f'{index:04d}.webp', quality=78, method=4)

process = subprocess.Popen([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', str(args.input),
    '-map', '0:v:0', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], stdout=subprocess.PIPE)
size = width * height * 3
count = 0
with ThreadPoolExecutor(max_workers=4) as pool:
    pending = set()
    while True:
        pixels = process.stdout.read(size)
        if not pixels:
            break
        if len(pixels) != size:
            raise RuntimeError('Incomplete source frame')
        pending.add(pool.submit(encode, count, pixels))
        count += 1
        if len(pending) >= 8:
            done, pending = wait(pending, return_when=FIRST_COMPLETED)
            for result in done:
                result.result()
    for result in pending:
        result.result()
if process.wait() != 0:
    raise RuntimeError('FFmpeg failed')
manifest = dict(source=args.input.name, count=count, width=width, height=height,
    fps=float(Fraction(stream['avg_frame_rate'])), duration=float(info['format']['duration']))
manifest['variants'] = {}
for variant in ('desktop', 'mobile'):
    frames = sorted((args.output / variant).glob('*.webp'))
    assert len(frames) == count
    for frame in frames:
        with Image.open(frame) as image:
            image.verify()
    manifest['variants'][variant] = dict(bytes=sum(f.stat().st_size for f in frames),
        width=width if variant == 'desktop' else 960, height=height if variant == 'desktop' else round(height * 960 / width))
(args.output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2), flush=True)

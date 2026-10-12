"""Offline asset preparation. Pass ffmpeg, studio MP4 and telescope MP4 paths.

The checked-in outputs need no encoder during deployment. Short GOPs, no B
frames and a leading MP4 index allow fast browser seeking and byte-range reads.
"""
import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parent.parent
output = root / "public/assets/scroll-video"
output.mkdir(parents=True, exist_ok=True)
ffmpeg, studio, telescope = sys.argv[1:]
manifest = {}
for name, source, count in [("studio", studio, 241), ("telescope", telescope, 233)]:
    manifest[name] = {}
    for variant, width, crf in [("desktop", 1280, 25), ("mobile", 960, 26)]:
        with tempfile.TemporaryDirectory() as temporary:
            encoded = pathlib.Path(temporary) / "sequence.mp4"
            subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", source,
                            "-an", "-vf", f"scale={width}:-2:flags=lanczos", "-r", "24",
                            "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
                            "-g", "12", "-keyint_min", "12", "-sc_threshold", "0", "-bf", "0",
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(encoded)], check=True)
            data = encoded.read_bytes()
        digest = hashlib.sha256(data).hexdigest()[:12]
        filename = f"{name}-{variant}-{digest}.mp4"
        (output / filename).write_bytes(data)
        manifest[name][variant] = dict(src=f"/assets/scroll-video/{filename}", width=width,
                                       height=width * 9 // 16, fps=24, frames=count, bytes=len(data))
        print(filename, len(data), flush=True)
(root / "lib/scroll-video.generated.json").write_text(json.dumps(manifest, indent=2) + "\n")

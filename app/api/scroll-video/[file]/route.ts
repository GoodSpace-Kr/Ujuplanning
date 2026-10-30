import { env } from 'cloudflare:workers';
import media from '@/lib/scroll-video.generated.json';
import serviceMedia from '@/lib/service-media.generated.json';
import projectMedia from '@/lib/project-media.generated.json';
import projectPreviews from '@/lib/project-previews.generated.json';
import { videoResponse } from '@/lib/video-response';

const assets = [...Object.values(media).flatMap(variants => Object.values(variants)), serviceMedia.video, ...projectMedia.reels.map(reel => reel.video), ...projectPreviews];

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const asset = assets.find(item => item.src.split('/').pop() === file);
  if (!asset) return new Response('Not found', { status: 404 });
  const binding = (env as unknown as { ASSETS: { fetch(request: Request): Promise<Response> } }).ASSETS;
  return videoResponse(request, { bytes: asset.bytes, etag: `"${file}"` }, async () => {
    const response = await binding.fetch(new Request(new URL(asset.src, request.url)));
    if (!response.ok) throw new Error('Media unavailable');
    return response.arrayBuffer();
  });
}

export const HEAD = GET;

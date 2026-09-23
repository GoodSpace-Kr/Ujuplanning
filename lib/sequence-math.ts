export const FRAME_COUNT = 233;
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

// Leave a short pause for the opening shot and the final brand message.
export function sequenceFrame(progress: number, reducedMotion = false) {
  if (reducedMotion) return progress < 0.75 ? 0 : FRAME_COUNT - 1;
  return Math.round(clamp01((progress - 0.04) / 0.86) * (FRAME_COUNT - 1));
}

export function coverCrop(width: number, height: number, viewWidth: number, viewHeight: number, frame: number) {
  const aspect = viewWidth / viewHeight;
  const cropWidth = Math.min(width, height * aspect);
  const cropHeight = Math.min(height, width / aspect);
  // Follow the eyepiece on narrow screens instead of cropping it out of view.
  const progress = frame / (FRAME_COUNT - 1);
  const focus = 0.55 - 0.05 * clamp01(progress / 0.48);
  return { x: Math.max(0, Math.min(width - cropWidth, width * focus - cropWidth / 2)), y: (height - cropHeight) / 2, width: cropWidth, height: cropHeight };
}

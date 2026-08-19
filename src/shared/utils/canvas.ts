// Canvas drawing & easing helpers — framework-agnostic, no React dependency.

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  objectPositionXPercent: number,
  objectPositionYPercent: number,
) {
  if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  const offsetX = (canvasW - drawW) * (objectPositionXPercent / 100);
  const offsetY = (canvasH - drawH) * (objectPositionYPercent / 100);

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

export function easeOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function easeInOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

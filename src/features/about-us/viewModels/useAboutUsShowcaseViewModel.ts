import { useEffect, useRef, useState } from "react";
import { ABOUT_US_GALLERY_ITEMS } from "./aboutUsContent";

// How quickly the rendered position chases the raw scroll-derived target
// each frame. This is pure inertia/lag for feel — the target itself is
// always exactly where the current scroll position says it should be, so
// when scrolling stops, there is nothing left to chase and the layers stay
// put instead of snapping into a separate "resting" position.
const CHASE_EASE = 0.16;

type LayerStyle = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  blur: number;
};

const CENTER: LayerStyle = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 };
const PREV: LayerStyle = { x: -55, y: -72, rotate: -14, scale: 0.75, opacity: 0.45, blur: 2 };
const NEXT: LayerStyle = { x: -18, y: 70, rotate: 12, scale: 0.6, opacity: 0.45, blur: 2 };
const PREV_FAR: LayerStyle = { x: -110, y: -150, rotate: -26, scale: 0.5, opacity: 0, blur: 5 };
const NEXT_FAR: LayerStyle = { x: -36, y: 140, rotate: 22, scale: 0.5, opacity: 0, blur: 5 };

// Ordered by distance-from-center ("delta"): -2 (fully exited on the prev
// side) through 0 (centered) to +2 (fully exited on the next side). Any
// item's on-screen position is just where its own delta from the live
// (smoothed) scroll position falls on this curve — one continuous function,
// not a per-slide animation with its own start/end.
const CURVE: Array<{ at: number } & LayerStyle> = [
  { at: -2, ...PREV_FAR },
  { at: -1, ...PREV },
  { at: 0, ...CENTER },
  { at: 1, ...NEXT },
  { at: 2, ...NEXT_FAR },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function layerStyleAt(delta: number): LayerStyle {
  const clamped = Math.max(-2, Math.min(2, delta));
  for (let i = 0; i < CURVE.length - 1; i++) {
    const a = CURVE[i];
    const b = CURVE[i + 1];
    if (clamped >= a.at && clamped <= b.at) {
      const t = (clamped - a.at) / (b.at - a.at);
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        rotate: lerp(a.rotate, b.rotate, t),
        scale: lerp(a.scale, b.scale, t),
        opacity: lerp(a.opacity, b.opacity, t),
        blur: lerp(a.blur, b.blur, t),
      };
    }
  }
  return CENTER;
}

export function useAboutUsShowcaseViewModel() {
  const items = ABOUT_US_GALLERY_ITEMS;
  const total = items.length;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const chasedIndexRef = useRef(0);
  const activeIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    let rafId: number;

    const getTargetIndex = () => {
      const container = containerRef.current;
      if (!container) return 0;
      const rect = container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return 0;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      return progress * (total - 1);
    };

    const tick = () => {
      const target = getTargetIndex();
      chasedIndexRef.current += (target - chasedIndexRef.current) * CHASE_EASE;
      if (Math.abs(target - chasedIndexRef.current) < 0.001) {
        chasedIndexRef.current = target;
      }

      for (let i = 0; i < total; i++) {
        const el = layerRefs.current[i];
        if (!el) continue;
        const delta = chasedIndexRef.current - i;
        const layer = layerStyleAt(delta);
        el.style.transform = `translate3d(${layer.x}px, ${layer.y}%, 0) rotate(${layer.rotate}deg) scale(${layer.scale})`;
        el.style.opacity = `${layer.opacity}`;
        el.style.filter = `blur(${layer.blur}px)`;
        el.style.zIndex = `${Math.round(30 - Math.min(2, Math.abs(delta)) * 10)}`;
      }

      const rounded = Math.max(
        0,
        Math.min(total - 1, Math.round(chasedIndexRef.current)),
      );
      if (rounded !== activeIndexRef.current) {
        setDirection(rounded > activeIndexRef.current ? 1 : -1);
        activeIndexRef.current = rounded;
        setActiveIndex(rounded);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [total]);

  return {
    data: { items },
    state: { activeIndex, direction },
    refs: { containerRef, layerRefs },
  };
}

export type AboutUsShowcaseViewModel = ReturnType<
  typeof useAboutUsShowcaseViewModel
>;

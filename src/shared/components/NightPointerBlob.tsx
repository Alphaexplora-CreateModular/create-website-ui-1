import { useEffect, useRef } from "react";

const BLOB_SIZE = 205;
const POINTER_EASE = 0.09;
const EXCLUDED_SELECTOR = ".home-header";
const MAX_STRETCH = 1.8;
const MIN_SQUASH = 0.55;
const STRETCH_SENSITIVITY = 0.05;
const STRETCH_EASE = 0.15;

type NightPointerBlobProps = {
  isNightMode: boolean;
};

export default function NightPointerBlob({
  isNightMode,
}: NightPointerBlobProps) {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const angleRef = useRef(0);
  const stretchRef = useRef(1);
  const isExcludedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const isNightModeRef = useRef(isNightMode);

  useEffect(() => {
    isNightModeRef.current = isNightMode;
  }, [isNightMode]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      isExcludedRef.current =
        e.target instanceof Element && !!e.target.closest(EXCLUDED_SELECTOR);
    };

    const handlePointerLeave = () => {
      targetRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    const render = () => {
      const blob = blobRef.current;
      const target = targetRef.current;

      if (blob) {
        if (target) {
          if (!posRef.current) {
            posRef.current = { ...target };
          } else {
            posRef.current.x += (target.x - posRef.current.x) * POINTER_EASE;
            posRef.current.y += (target.y - posRef.current.y) * POINTER_EASE;
          }
        }

        const visible =
          isNightModeRef.current && !isExcludedRef.current && !!target;
        blob.style.opacity = visible ? "1" : "0";

        if (posRef.current) {
          const prevPos = prevPosRef.current ?? posRef.current;
          const dx = posRef.current.x - prevPos.x;
          const dy = posRef.current.y - prevPos.y;
          const speed = Math.hypot(dx, dy);

          if (speed > 0.4) {
            angleRef.current = Math.atan2(dy, dx);
          }

          const targetStretch = Math.min(
            MAX_STRETCH,
            1 + speed * STRETCH_SENSITIVITY,
          );
          stretchRef.current +=
            (targetStretch - stretchRef.current) * STRETCH_EASE;

          const scaleX = stretchRef.current;
          const scaleY = Math.max(MIN_SQUASH, 1 / scaleX);

          prevPosRef.current = { ...posRef.current };

          blob.style.transform = `translate3d(${
            posRef.current.x - BLOB_SIZE / 2
          }px, ${
            posRef.current.y - BLOB_SIZE / 2
          }px, 0) rotate(${angleRef.current}rad) scale(${scaleX}, ${scaleY})`;
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={blobRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        borderRadius: "50%",
        background: "#FFF",
        mixBlendMode: "soft-light",
        filter: "blur(20.549999237060547px)",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 9999,
        transition: "opacity 0.3s ease",
        willChange: "transform, opacity",
      }}
    />
  );
}

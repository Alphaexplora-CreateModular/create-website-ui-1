import type { CSSProperties } from "react";

type FlyInWordsProps = {
  text: string;
  baseDelay: number;
  stagger: number;
  duration?: number;
  flyDistance?: number;
};

// Splits `text` into words and flies each one in with a staggered delay.
// Used by the About Us and Home Process intro headers — key-remounting the
// parent replays this every time the intro reappears, since CSS keyframe
// animations only run again when the element is freshly created in the DOM.
export function FlyInWords({
  text,
  baseDelay,
  stagger,
  duration = 650,
  flyDistance = 24,
}: FlyInWordsProps) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, index) => (
        <span key={word + index} style={{ display: "inline-block" }}>
          <span
            style={
              {
                display: "inline-block",
                opacity: 0,
                animationName: "flyInWord",
                animationDuration: `${duration}ms`,
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                animationDelay: `${baseDelay + index * stagger}ms`,
                animationFillMode: "both",
                ["--fly-y" as string]: `${flyDistance}px`,
              } as CSSProperties
            }
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

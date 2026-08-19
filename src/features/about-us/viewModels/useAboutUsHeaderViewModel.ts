import { useMemo, useRef } from "react";
import { ABOUT_US_STEPS } from "./aboutUsContent";

const INTRO_LABEL = "What we do";
const INTRO_HEADING = "Custom solutions for every space";
const INTRO_PARAGRAPH =
  "Take a journey through our process to see how ideas evolve into complete architectural realities.";

const LABEL_STAGGER_MS = 45;
const LABEL_BASE_DELAY_MS = 0;
const LABEL_DURATION_MS = 500;
const HEADING_STAGGER_MS = 45;
const HEADING_BASE_DELAY_MS =
  LABEL_BASE_DELAY_MS + INTRO_LABEL.split(" ").length * LABEL_STAGGER_MS + 200;
const HEADING_DURATION_MS = 700;
const PARAGRAPH_STAGGER_MS = 22;
const PARAGRAPH_BASE_DELAY_MS =
  HEADING_BASE_DELAY_MS +
  INTRO_HEADING.split(" ").length * HEADING_STAGGER_MS +
  250;
const PARAGRAPH_DURATION_MS = 600;
const SCROLL_INDICATOR_DELAY_MS =
  PARAGRAPH_BASE_DELAY_MS +
  INTRO_PARAGRAPH.split(" ").length * PARAGRAPH_STAGGER_MS +
  500;
const SCROLL_INDICATOR_DURATION_MS = 600;

const INTRO_ANIMATION_COMPLETE_MS = Math.max(
  LABEL_BASE_DELAY_MS +
    (Math.max(0, INTRO_LABEL.split(" ").length - 1) * LABEL_STAGGER_MS +
      LABEL_DURATION_MS),
  HEADING_BASE_DELAY_MS +
    (Math.max(0, INTRO_HEADING.split(" ").length - 1) * HEADING_STAGGER_MS +
      HEADING_DURATION_MS),
  PARAGRAPH_BASE_DELAY_MS +
    (Math.max(0, INTRO_PARAGRAPH.split(" ").length - 1) *
      PARAGRAPH_STAGGER_MS +
      PARAGRAPH_DURATION_MS),
  SCROLL_INDICATOR_DELAY_MS + SCROLL_INDICATOR_DURATION_MS,
);

export type AboutUsHeaderRefs = {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  introRef: React.RefObject<HTMLDivElement>;
  stepRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
};

export function useAboutUsHeaderViewModel() {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const refs = useMemo(
    () => ({
      videoContainerRef,
      videoRef,
      introRef,
      stepRefs,
    }),
    [],
  );

  return {
    data: {
      introLabel: INTRO_LABEL,
      introHeading: INTRO_HEADING,
      introParagraph: INTRO_PARAGRAPH,
      timing: {
        labelBaseDelayMs: LABEL_BASE_DELAY_MS,
        labelStaggerMs: LABEL_STAGGER_MS,
        headingBaseDelayMs: HEADING_BASE_DELAY_MS,
        headingStaggerMs: HEADING_STAGGER_MS,
        paragraphBaseDelayMs: PARAGRAPH_BASE_DELAY_MS,
        paragraphStaggerMs: PARAGRAPH_STAGGER_MS,
        scrollIndicatorDelayMs: SCROLL_INDICATOR_DELAY_MS,
        introAnimationCompleteMs: INTRO_ANIMATION_COMPLETE_MS,
      },
      steps: ABOUT_US_STEPS,
    },
    refs: refs as AboutUsHeaderRefs,
  };
}

export type AboutUsHeaderViewModel = ReturnType<typeof useAboutUsHeaderViewModel>;
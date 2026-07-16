import { useCallback, useMemo, useState } from "react";

export function useServiceOverviewViewModel() {
  const [isNight, setIsNight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeNight = useMemo(() => isNight || isHovered, [isNight, isHovered]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);
  const onClick = useCallback(() => {
    setIsNight((prev) => !prev);
    setIsHovered(false);
  }, []);

  return {
    activeNight,
    onMouseEnter,
    onMouseLeave,
    onClick,
  };
}

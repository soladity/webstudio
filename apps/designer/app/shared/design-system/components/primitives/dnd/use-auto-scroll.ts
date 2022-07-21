import { useRef, type MutableRefObject } from "react";

// Time between frames of scroll animation in milliseconds
const FRAME_PERIOD = 30;

const getSpeed = (
  pointerPosition: number,
  containerStart: number,
  containerEnd: number,
  edgeDistanceThreshold: number,
  minSpeed: number,
  maxSpeed: number
) => {
  const thresholdSafe = Math.min(
    (containerEnd - containerStart) / 2,
    edgeDistanceThreshold
  );

  const startAdjusted = containerStart + thresholdSafe;
  const endAdjusted = containerEnd - thresholdSafe;

  const distanceFromEdgeToSpeed = (distance: number) => {
    // between 0 and 1
    const normalized = Math.min(distance, thresholdSafe) / thresholdSafe;

    // speed in pixels per second
    return minSpeed + normalized * (maxSpeed - minSpeed);
  };

  if (pointerPosition < startAdjusted) {
    return -1 * distanceFromEdgeToSpeed(startAdjusted - pointerPosition);
  }

  if (pointerPosition > endAdjusted) {
    return distanceFromEdgeToSpeed(pointerPosition - endAdjusted);
  }

  return 0;
};

export type Parameters = {
  target: MutableRefObject<HTMLElement | null>;
  edgeDistanceThreshold?: number;

  // min/max speed of the scroll animation in pixels per second
  minSpeed?: number;
  maxSpeed?: number;
};

export const useAutoScroll = ({
  target,
  edgeDistanceThreshold = 100,
  minSpeed = 1,
  maxSpeed = 500,
}: Parameters): {
  handleMove: (pointerCoordinate: { x: number; y: number }) => void;
  setEnabled: (enabled: boolean) => void;
} => {
  const state = useRef({
    enabled: false,
    prevTimestamp: undefined as number | undefined,
    speedX: 0,
    speedY: 0,
    stepScheduled: false,
  });

  const step = (timestamp: number) => {
    state.current.stepScheduled = false;

    if (
      !state.current.enabled ||
      target.current === null ||
      (Math.round(state.current.speedX * FRAME_PERIOD) === 0 &&
        Math.round(state.current.speedY * FRAME_PERIOD) === 0)
    ) {
      return;
    }

    if (state.current.prevTimestamp === undefined) {
      state.current.prevTimestamp = timestamp;
      scheduleStep();
      return;
    }

    const elapsed = timestamp - state.current.prevTimestamp;

    if (elapsed < FRAME_PERIOD) {
      scheduleStep();
      return;
    }

    state.current.prevTimestamp = timestamp;

    target.current.scrollBy(
      (state.current.speedX / 1000) * elapsed,
      (state.current.speedY / 1000) * elapsed
    );

    scheduleStep();
  };

  const scheduleStep = () => {
    if (!state.current.stepScheduled) {
      state.current.stepScheduled = true;
      window.requestAnimationFrame(step);
    }
  };

  return {
    handleMove({ x, y }) {
      if (!state.current.enabled || target.current === null) {
        return;
      }

      const rect = target.current.getBoundingClientRect();

      state.current.speedY = getSpeed(
        y,
        rect.top,
        rect.bottom,
        edgeDistanceThreshold,
        minSpeed,
        maxSpeed
      );

      state.current.speedX = getSpeed(
        x,
        rect.left,
        rect.right,
        edgeDistanceThreshold,
        minSpeed,
        maxSpeed
      );

      scheduleStep();
    },
    setEnabled(newEnabled) {
      state.current.enabled = newEnabled;
      state.current.prevTimestamp = undefined;
      scheduleStep();
    },
  };
};

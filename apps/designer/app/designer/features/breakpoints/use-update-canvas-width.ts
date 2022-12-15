import { useCallback, useEffect } from "react";
import {
  useSelectedBreakpoint,
  useCanvasWidth,
} from "~/designer/shared/nano-states";
import { useIsPreviewMode } from "~/shared/nano-states";
import { useNextBreakpoint } from "./use-next-breakpoint";
import { minWidth } from "./width-setting";

export const useUpdateCanvasWidth = () => {
  const [selectedBreakpoint] = useSelectedBreakpoint();
  const [canvasWidth, setCanvasWidth] = useCanvasWidth();
  const [isPreviewMode] = useIsPreviewMode();
  const nextBreakpoint = useNextBreakpoint();

  // Ensure the size is within currently selected breakpoint when returning to design mode out of preview mode,
  // because preview mode enables resizing without constraining to the selected breakpoint.
  useEffect(() => {
    if (isPreviewMode || selectedBreakpoint === undefined) {
      return;
    }
    const nextWidth = nextBreakpoint
      ? nextBreakpoint.minWidth - 1
      : selectedBreakpoint.minWidth;
    setCanvasWidth(Math.max(nextWidth, minWidth));
  }, [isPreviewMode, nextBreakpoint, selectedBreakpoint, setCanvasWidth]);

  // This fallback is needed for cases when something unexpected loads in the iframe.
  // In that case the width remains 0, and user is unable to see what has loaded,
  // in particular any error messages.
  // The delay is used to make sure we don't set the fallback width too early,
  // because when canvas loads normally this will cause a jump in the width.
  useEffect(() => {
    if (canvasWidth !== 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setCanvasWidth(600);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [canvasWidth, setCanvasWidth]);

  // Set the initial canvas width based on the selected breakpoint upper bound, which starts where the next breakpoint begins.
  return useCallback(
    (iframe: HTMLIFrameElement | null) => {
      // Once canvasWidth is set, it means we have already set the initial width.
      if (
        iframe === null ||
        selectedBreakpoint === undefined ||
        canvasWidth !== 0
      ) {
        return;
      }

      setCanvasWidth(minWidth);
    },
    [canvasWidth, selectedBreakpoint, setCanvasWidth]
  );
};

import { forwardRef, type ComponentProps, type ElementRef } from "react";
import {
  useCanvasWidth,
  useZoom,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-states";
import { willRender } from "~/designer/shared/breakpoints";
import { Button, Text } from "@webstudio-is/design-system";

type TriggerButtonProps = ComponentProps<typeof Button>;

export const TriggerButton = forwardRef<
  ElementRef<typeof Button>,
  TriggerButtonProps
>((props, ref) => {
  const [zoom] = useZoom();
  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth] = useCanvasWidth();
  if (breakpoint === undefined) {
    return null;
  }
  const variant = willRender(breakpoint, canvasWidth) ? "contrast" : "subtle";

  return (
    <Button {...props} ref={ref} color="dark" aria-label="Show breakpoints">
      <Text color={variant}>
        {`${breakpoint.label} ${canvasWidth}px / ${zoom}%`}
      </Text>
    </Button>
  );
});

TriggerButton.displayName = "TriggerButton";

import { forwardRef, type ComponentProps, type ElementRef } from "react";
import { type Breakpoint } from "@webstudio-is/sdk";
import {
  useCanvasWidth,
  useZoom,
  useSelectedBreakpoint,
} from "apps/designer/app/designer/shared/nano-states";
import { willRender } from "apps/designer/app/designer/shared/breakpoints";
import { Button, Text } from "apps/designer/app/shared/design-system";
import {
  DesktopIcon,
  LaptopIcon,
  MobileIcon,
  TabletIcon,
} from "apps/designer/app/shared/icons";

type TriggerButtonProps = ComponentProps<typeof Button>;

const renderIcon = (breakpoint: Breakpoint, variant: "contrast" | "gray") => {
  const color = variant === "contrast" ? "white" : "gray";
  if (breakpoint.minWidth >= 1280) {
    return <DesktopIcon color={color} />;
  }
  if (breakpoint.minWidth >= 1024) {
    return <LaptopIcon color={color} />;
  }
  if (breakpoint.minWidth >= 768) {
    return <TabletIcon color={color} />;
  }
  return <MobileIcon color={color} />;
};

export const TriggerButton = forwardRef<
  ElementRef<typeof Button>,
  TriggerButtonProps
>((props, ref) => {
  const [zoom] = useZoom();
  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth] = useCanvasWidth();
  if (breakpoint === undefined) return null;
  const variant = willRender(breakpoint, canvasWidth) ? "contrast" : "gray";

  return (
    <Button
      {...props}
      ref={ref}
      css={{ gap: "$1" }}
      ghost
      aria-label="Show breakpoints"
    >
      {renderIcon(breakpoint, variant)}
      <Text size="1" variant={variant}>
        {`${breakpoint.label} ${canvasWidth}px / ${zoom}%`}
      </Text>
    </Button>
  );
});

TriggerButton.displayName = "TriggerButton";

import { forwardRef, type ComponentProps, type ElementRef } from "react";
import { type Breakpoint } from "@webstudio-is/sdk";
import {
  useCanvasWidth,
  useScale,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-values";
import { Button, Text } from "~/shared/design-system";
import {
  DesktopIcon,
  LaptopIcon,
  MobileIcon,
  TabletIcon,
  DevicesIcon,
} from "~/shared/icons";

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
  if (breakpoint.minWidth >= 360) {
    return <MobileIcon color={color} />;
  }
  return <DevicesIcon color={color} />;
};

export const TriggerButton = forwardRef<
  ElementRef<typeof Button>,
  TriggerButtonProps
>((props, ref) => {
  const [scale] = useScale();
  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth = 0] = useCanvasWidth();
  if (breakpoint === undefined) return null;
  const variant = canvasWidth >= breakpoint.minWidth ? "contrast" : "gray";
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
        {`${breakpoint.label} ${canvasWidth}px / ${scale}%`}
      </Text>
    </Button>
  );
});

TriggerButton.displayName = "TriggerButton";

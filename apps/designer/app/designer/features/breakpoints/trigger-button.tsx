import { forwardRef, type ComponentProps, type ElementRef } from "react";
import { type Breakpoint } from "@webstudio-is/css-data";
import {
  useCanvasWidth,
  useZoom,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-states";
import { willRender } from "~/designer/shared/breakpoints";
import { DeprecatedButton, DeprecatedText2 } from "@webstudio-is/design-system";
import {
  DesktopIcon,
  LaptopIcon,
  MobileIcon,
  TabletIcon,
} from "@webstudio-is/icons";
import { theme } from "@webstudio-is/design-system";

type TriggerButtonProps = ComponentProps<typeof DeprecatedButton>;

const renderIcon = (breakpoint: Breakpoint, variant: "contrast" | "hint") => {
  const color = variant === "contrast" ? "white" : "hint";
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
  ElementRef<typeof DeprecatedButton>,
  TriggerButtonProps
>((props, ref) => {
  const [zoom] = useZoom();
  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth] = useCanvasWidth();
  if (breakpoint === undefined) {
    return null;
  }
  const variant = willRender(breakpoint, canvasWidth) ? "contrast" : "hint";

  return (
    <DeprecatedButton
      {...props}
      ref={ref}
      css={{ gap: theme.spacing[3] }}
      ghost
      aria-label="Show breakpoints"
    >
      {renderIcon(breakpoint, variant)}
      <DeprecatedText2 color={variant}>
        {`${breakpoint.label} ${canvasWidth}px / ${zoom}%`}
      </DeprecatedText2>
    </DeprecatedButton>
  );
});

TriggerButton.displayName = "TriggerButton";

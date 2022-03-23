import { forwardRef } from "react";
import { css } from "~/shared/design-system";

const iframeStyle = css({
  gridArea: "canvas",
  width: "100%",
  height: "100%",
  border: "none",
  variants: {
    pointerEvents: {
      none: {
        pointerEvents: "none",
      },
      all: {
        pointerEvents: "all",
      },
    },
  },
});

type CanvasIframeProps = {
  pointerEvents: "all" | "none";
  src: string;
  title: string;
};

export const CanvasIframe = forwardRef<HTMLIFrameElement, CanvasIframeProps>(
  ({ pointerEvents = "all", ...rest }, ref) => {
    return (
      <iframe {...rest} ref={ref} className={iframeStyle({ pointerEvents })} />
    );
  }
);

CanvasIframe.displayName = "CanvasIframe";

import * as React from "react";
import type { IconProps } from "./types";

export const UndoIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="15"
        width="15"
        viewBox="0 0 24 24"
        fill={color}
        {...props}
        ref={forwardedRef}
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
      </svg>
    );
  }
);

UndoIcon.displayName = "UndoIcon";

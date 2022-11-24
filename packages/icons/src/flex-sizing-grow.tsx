import * as React from "react";
import { IconProps } from "./types";

export const FlexSizingGrowIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        {...props}
        ref={forwardedRef}
      >
        <path
          fill={color}
          d="M10.7641 5.54038c-.2539-.25384-.6654-.25384-.91928 0-.25384.25384-.25384.6654 0 .91924l.91928-.91924ZM12.3044 8l.4597.45962c.2538-.25384.2538-.6654 0-.91924L12.3044 8ZM9.84482 9.54038c-.25384.25384-.25384.66542 0 .91922.25388.2539.66538.2539.91928 0l-.91928-.91922ZM7.80469 7.35c-.35899 0-.65.29101-.65.65 0 .35899.29101.65.65.65v-1.3Zm2.04013-.89038 1.99998 2 .9193-.91924-2-2-.91928.91924Zm1.99998 1.08076-1.99998 2 .91928.91922 2-1.99998-.9193-.91924ZM7.80469 8.65h4.49971v-1.3H7.80469v1.3Z"
        />
        <path
          fill={color}
          d="m3.69531 8-.45962-.45962c-.25384.25384-.25384.6654 0 .91924L3.69531 8Zm2.45962-1.54038c.25384-.25384.25384-.6654 0-.91924-.25384-.25384-.6654-.25384-.91924 0l.91924.91924Zm-.91924 3.99998c.25384.2539.6654.2539.91924 0 .25384-.2538.25384-.66538 0-.91922l-.91924.91922ZM8.19556 8.65c.35898 0 .65-.29101.65-.65 0-.35899-.29102-.65-.65-.65v1.3Zm-4.04063-.19038 2-2-.91924-.91924-2 2 .91924.91924Zm-.91924 0 2 1.99998.91924-.91922-2-2-.91924.91924Zm.45962.19038h4.50025v-1.3H3.69531v1.3Z"
        />
        <path
          stroke={color}
          strokeLinecap="round"
          strokeWidth="1.4"
          d="M1.5 2.5v11m13-11v11"
        />
      </svg>
    );
  }
);
FlexSizingGrowIcon.displayName = "FlexSizingGrowIcon";

import * as React from "react";
import { IconProps } from "./types";

export const FlexWrapWrap = React.forwardRef<SVGSVGElement, IconProps>(
  (props, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path d="M16 13H20V20H16V13Z" fill="#11181C" />
        <path d="M4 13H8V20H4V13Z" fill="#11181C" />
        <path d="M10 13H14V20H10V13Z" fill="#11181C" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 5H11V10H13V5ZM19 5H17V10H19V5ZM7 5H5V10H7V5ZM19 14H17V19H19V14ZM7 14H5V19H7V14ZM13 14H11V19H13V14ZM8 4V11H4V4H8ZM10 4V11H14V4H10ZM16 4V11H20V4H16ZM16 13V20H20V13H16ZM8 13V20H4V13H8ZM10 13V20H14V13H10Z"
          fill="#11181C"
        />
      </svg>
    );
  }
);
FlexWrapWrap.displayName = "FlexWrapWrap";

export const FlexWrapNowrap = React.forwardRef<SVGSVGElement, IconProps>(
  (props, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 9H11V15H13V9ZM19 9H17V15H19V9ZM7 9H5V15H7V9ZM4 8V16H8V8H4ZM14 8V16H10V8H14ZM20 8V16H16V8H20Z"
          fill="#11181C"
        />
      </svg>
    );
  }
);
FlexWrapNowrap.displayName = "FlexWrapNowrap";

export const FlexWrapWrapReverse = React.forwardRef<SVGSVGElement, IconProps>(
  (props, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
        style={{ transform: "rotate(180deg)" }}
      >
        <path d="M16 13H20V20H16V13Z" fill="#11181C" />
        <path d="M4 13H8V20H4V13Z" fill="#11181C" />
        <path d="M10 13H14V20H10V13Z" fill="#11181C" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 5H11V10H13V5ZM19 5H17V10H19V5ZM7 5H5V10H7V5ZM19 14H17V19H19V14ZM7 14H5V19H7V14ZM13 14H11V19H13V14ZM8 4V11H4V4H8ZM10 4V11H14V4H10ZM16 4V11H20V4H16ZM16 13V20H20V13H16ZM8 13V20H4V13H8ZM10 13V20H14V13H10Z"
          fill="#11181C"
        />
      </svg>
    );
  }
);
FlexWrapWrapReverse.displayName = "FlexWrapWrapReverse";

export const flexWrap = {
  normal: FlexWrapNowrap,
  nowrap: FlexWrapNowrap,
  wrap: FlexWrapWrap,
  "wrap-reverse": FlexWrapWrapReverse,
};

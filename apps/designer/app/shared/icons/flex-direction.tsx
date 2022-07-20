import * as React from "react";
import { IconProps } from "./types";

export const FlexDirectionRow = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M2 24C0.89543 24 -3.91405e-08 23.1046 -8.74228e-08 22L-9.61651e-07 2C-1.00993e-06 0.89543 0.89543 -3.91405e-08 2 -8.74228e-08L22 -9.61651e-07C23.1046 -1.00993e-06 24 0.89543 24 2L24 22C24 23.1046 23.1046 24 22 24L2 24Z"
          fill="white"
        />
        <path
          d="M5 12.8334L14.8881 12.8334L11.9794 15.825L13.125 17L18 12L13.125 7.00003L11.9794 8.17503L14.8881 11.1667L5 11.1667V12.8334Z"
          fill="#11181C"
        />
      </svg>
    );
  }
);

export const FlexDirectionColumn = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M2 24C0.89543 24 -3.91405e-08 23.1046 -8.74228e-08 22L-9.61651e-07 2C-1.00993e-06 0.89543 0.89543 -3.91405e-08 2 -8.74228e-08L22 -9.61651e-07C23.1046 -1.00993e-06 24 0.89543 24 2L24 22C24 23.1046 23.1046 24 22 24L2 24Z"
          fill="white"
        />
        <path
          d="M11.1667 6L11.1667 15.8881L8.175 12.9794L7 14.125L12 19L17 14.125L15.825 12.9794L12.8333 15.8881L12.8333 6L11.1667 6Z"
          fill="#11181C"
        />
      </svg>
    );
  }
);

export const FlexDirectionRowReverse = React.forwardRef<
  SVGSVGElement,
  IconProps
>(({ color = "currentColor", ...props }, forwardedRef) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={forwardedRef}
      style={{ transform: "rotate(180deg)" }}
    >
      <path
        d="M2 24C0.89543 24 -3.91405e-08 23.1046 -8.74228e-08 22L-9.61651e-07 2C-1.00993e-06 0.89543 0.89543 -3.91405e-08 2 -8.74228e-08L22 -9.61651e-07C23.1046 -1.00993e-06 24 0.89543 24 2L24 22C24 23.1046 23.1046 24 22 24L2 24Z"
        fill="white"
      />
      <path
        d="M5 12.8334L14.8881 12.8334L11.9794 15.825L13.125 17L18 12L13.125 7.00003L11.9794 8.17503L14.8881 11.1667L5 11.1667V12.8334Z"
        fill="#11181C"
      />
    </svg>
  );
});

export const FlexDirectionColumnReverse = React.forwardRef<
  SVGSVGElement,
  IconProps
>(({ color = "currentColor", ...props }, forwardedRef) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={forwardedRef}
      style={{ transform: "rotate(180deg)" }}
    >
      <path
        d="M2 24C0.89543 24 -3.91405e-08 23.1046 -8.74228e-08 22L-9.61651e-07 2C-1.00993e-06 0.89543 0.89543 -3.91405e-08 2 -8.74228e-08L22 -9.61651e-07C23.1046 -1.00993e-06 24 0.89543 24 2L24 22C24 23.1046 23.1046 24 22 24L2 24Z"
        fill="white"
      />
      <path
        d="M11.1667 6L11.1667 15.8881L8.175 12.9794L7 14.125L12 19L17 14.125L15.825 12.9794L12.8333 15.8881L12.8333 6L11.1667 6Z"
        fill="#11181C"
      />
    </svg>
  );
});

export const flexDirection = {
  normal: FlexDirectionRow,
  row: FlexDirectionRow,
  column: FlexDirectionColumn,
  "row-reverse": FlexDirectionRowReverse,
  "column-reverse": FlexDirectionColumnReverse,
};

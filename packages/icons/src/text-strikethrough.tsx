import * as React from "react";
import { IconProps } from "./types";

export const TextStrikethroughIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M5.82521 2.94998C6.50328 2.40116 7.40433 2.125 8.34865 2.125C9.89864 2.125 11.3095 2.79299 11.8362 4.32438C11.9485 4.65079 11.7748 5.0064 11.4484 5.11866C11.122 5.23092 10.7664 5.05731 10.6541 4.7309C10.3558 3.86342 9.55544 3.375 8.34865 3.375C7.6374 3.375 7.02905 3.58374 6.61162 3.9216C6.20592 4.24996 5.95485 4.71776 5.95485 5.32689C5.95485 5.8952 6.21462 6.25961 6.54642 6.52111C6.66036 6.61091 6.78052 6.6864 6.89868 6.75H5.09412C4.86079 6.37035 4.70485 5.90046 4.70485 5.32689C4.70485 4.32895 5.1354 3.50829 5.82521 2.94998Z"
          fill={color}
        />
        <path
          d="M10.6813 9.75H12.0228C12.0884 9.99225 12.125 10.2587 12.125 10.5514C12.125 11.5568 11.7375 12.4146 11.0147 13.009C10.3059 13.5919 9.33318 13.875 8.22795 13.875C6.42452 13.875 5.0547 13.2188 4.51522 11.7922C4.39313 11.4693 4.55589 11.1086 4.87875 10.9865C5.20162 10.8644 5.56233 11.0272 5.68441 11.3501C5.96897 12.1026 6.70934 12.625 8.22795 12.625C9.13269 12.625 9.79597 12.3929 10.2207 12.0436C10.6315 11.7058 10.875 11.2143 10.875 10.5514C10.875 10.2188 10.8015 9.95921 10.6813 9.75Z"
          fill={color}
        />
        <path
          d="M3.00012 7.58447C2.65494 7.58447 2.37512 7.86429 2.37512 8.20947C2.37512 8.55465 2.65494 8.83447 3.00012 8.83447H13.0001C13.3453 8.83447 13.6251 8.55465 13.6251 8.20947C13.6251 7.86429 13.3453 7.58447 13.0001 7.58447H3.00012Z"
          fill={color}
        />
      </svg>
    );
  }
);
TextStrikethroughIcon.displayName = "TextStrikethroughIcon";
